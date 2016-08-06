'use strict';

var fs = require('fs');
var path = require('path');
var map = require('lodash/map');
var each = require('lodash/each');
var Promise = require('bluebird');
var ncp = require('ncp').ncp;
var Database = require('../server/Database');
var ChangeStore = require('../server/ChangeStore');
var DocumentStore = require('../server/DocumentStore');
var SnapshotStore = require('../server/SnapshotStore');
var UserStore = require('../server/UserStore');

var exportPath;

// Check if path argument was provided and path existed
// otherwise exit script with wrong argument state
if (process.argv[2]) {
  exportPath = process.argv[2];
  fs.access(exportPath, fs.F_OK, function(err) {
    if (err) {
      // eslint-disable-next-line
      console.error('Please provide existed path to backup folder');
      return process.exit(9);
    }
  });
} else {
  // eslint-disable-next-line
  console.error('You should provide path to backup folder');
  return process.exit(9);
}

var ServerConfigurator = require('../packages/server/ServerConfigurator');
var ServerPackage = require('../packages/server/package');
var configurator = new ServerConfigurator().import(ServerPackage);
var SnapshotEngine = require('substance/collab/SnapshotEngine');

var db = new Database();
var userStore = new UserStore({db: db});
var changeStore = new ChangeStore({db: db});
var documentStore = new DocumentStore({db: db});
var snapshotStore = new SnapshotStore({db: db});

var snapshotEngine = new SnapshotEngine({
  configurator: configurator,
  documentStore: documentStore,
  changeStore: changeStore,
  snapshotStore: snapshotStore
});

// Number of documents to proccess in one query
var stepSize = 100;
var currentStep = 0;
// Path to export
var exportDataPath = path.normalize(exportPath + '/notes-backup');
// We will fill this object with data
var exportedData = {
  changes: {},
  documents: {},
  snapshots: {},
  users: {}
};

var ensureExists = function(path, mask, cb) {
  // allow the mask parameter to be optional
  if (typeof mask === 'function') {
    cb = mask;
    mask = 484;
  }
  fs.mkdir(path, mask, function(err) {
    if (err) {
      // ignore the error if the folder already exists
      if (err.code === 'EEXIST') {
        return cb(null);
      } else {
        cb(err); 
      }
    }
    cb(null);
  });
};

var exportJSON = function(data) {
  return new Promise(function(resolve, reject) {
    ensureExists(exportDataPath, function(err) {
      if (err) return reject(err);
      fs.writeFile(exportDataPath + '/data.json', JSON.stringify(data), function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

var exportUploads = function() {
  return new Promise(function(resolve, reject) {
    var exportUploadsPath = exportDataPath + '/uploads';
    ensureExists(exportUploadsPath, function(err) {
      if (err) return reject(err);
      ncp('./uploads', exportUploadsPath, function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

var getTotalDocuments = function() {
  return new Promise(function(resolve, reject) {
    documentStore.countDocuments({}, function(err, count) {
      if(err) {
        return reject(err);
      }
      resolve(count);
    });
  });
};

var getDocumentsPack = function() {
  return new Promise(function(resolve, reject) {
    documentStore.listDocuments({}, {
      limit: stepSize,
      offset: currentStep * stepSize,
      fields: ['documentId', 'schemaName', 'schemaVersion', 'version', 'info', 'userId']
    }, function(err, docs) {
      if(err) {
        return reject(err);
      }
      currentStep += 1;
      resolve(docs);
    });
  });
};

var exportSnapshot = function(documentId, version) {
  return new Promise(function(resolve, reject) {
    snapshotStore.snapshotExists(documentId, version, function(err, exists) {
      if(err) {
        return reject(err);
      }

      // If snpahot exists let's get it from db,
      // otherwise request a new one
      if(exists) {
        snapshotStore.getSnapshot({
          documentId: documentId,
          version: version
        }, function(err, snapshot) {
          if(err) {
            return reject(err);
          }
          resolve(snapshot); 
        });
      } else {
        snapshotEngine.createSnapshot({
          documentId: documentId
        }, function(err, snapshot) {
          if(err) {
            return reject(err);
          }
          resolve(snapshot);
        });
      }
    });
  });
};

var proccessDocument = function(document) {
  return new Promise(function(resolve) {
    document.version = 1;
    exportedData.documents[document.documentId] = document;
    return exportSnapshot(document.documentId, document.version)
      .then(function(snapshot) {
        snapshot.version = 1;
        exportedData.snapshots[document.documentId] = {};
        exportedData.snapshots[document.documentId][snapshot.version] = snapshot;
        exportedData.changes[document.documentId] = [{documentId: document.documentId}];
        resolve();
      });
  });
};

var promiseWhile = Promise.method(function(condition, action) {
  if (!condition()) return 0;
  return action().then(promiseWhile.bind(null, condition, action));
});

getTotalDocuments()
  .then(function(total) {
    // eslint-disable-next-line
    console.log('Starting export of', total, 'documents...');
    return promiseWhile(function() {
      return stepSize * currentStep < total;
    }, function() {
      return getDocumentsPack()
        .then(function(docs) {
          var actions = map(docs, proccessDocument);
          return Promise.all(actions);
        });
    });
  })
  .then(function() {
    currentStep = 0;
    return userStore.countUsers({});
  })
  .then(function(total) {
    // eslint-disable-next-line
    console.log('Starting export of', total, 'users...');
    return promiseWhile(function() {
      return stepSize * currentStep < total;
    }, function() {
      return userStore.listUsers({}, {
        limit: stepSize,
        offset: currentStep * stepSize,
        fields: ['userId', 'name', 'loginKey', 'email']
      }).then(function(users) {
        currentStep += 1;
        return new Promise(function(resolve) {
          each(users, function(user) {
            exportedData.users[user.userId] = user;
          });
          resolve();
        });
      });
    });
  })
  .then(function() {
    db.shutdown();
    return exportJSON(exportedData);
  })
  .then(function() {
    // eslint-disable-next-line
    console.log('Export uploads folder...');
    return exportUploads();
  })
  .then(function() {
    // eslint-disable-next-line
    console.log('Done.');
  })
  .catch(function(err){
    // eslint-disable-next-line
    console.error(err);
    db.shutdown();
    process.exit(1);
  });