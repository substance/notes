'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var ncp = require('ncp').ncp;
var Database = require('../server/Database');
var ChangeStore = require('../server/ChangeStore');
var DocumentStore = require('../server/DocumentStore');
var SnapshotStore = require('../server/SnapshotStore');
var UserStore = require('../server/UserStore');

var backupPath;

// Check if path argument was provided and path existed
// otherwise exit script with wrong argument state
if (process.argv[2]) {
  backupPath = process.argv[2];
  fs.access(backupPath, fs.F_OK, function(err) {
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

var db = new Database();
var backupData;

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

var importUploads = function() {
  return new Promise(function(resolve, reject) {
    var importUploadsPath = path.normalize(backupPath + '/uploads');
    ensureExists(importUploadsPath, function(err) {
      if (err) return reject(err);
      ncp(importUploadsPath, './uploads', function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};


// eslint-disable-next-line
console.log('Starting data restoring...');

db.reset() // Clear the database, set up the schema
  .then(function() {
    return new Promise(function(resolve, reject) {
      var dataPath = path.normalize(backupPath + '/data.json');
      fs.readFile(dataPath, function (err, data) {
        if (err) return reject(err);
        backupData = JSON.parse(data);
        resolve();
      });
    });
  })
  .then(function() {
    var userStore = new UserStore({ db: db });
    return userStore.seed(backupData.users);
  }).then(function() {
    var documentStore = new DocumentStore({db: db});
    return documentStore.seed(backupData.documents);
  }).then(function() {
    var snapshotStore = new SnapshotStore({db: db});
    return snapshotStore.seed(backupData.snapshots);
  }).then(function() {
    var changesStore = new ChangeStore({db: db});
    return changesStore.seed(backupData.changes);
  }).then(function() {
    // eslint-disable-next-line
    console.log('Importing uploads folder...');
    return importUploads();
  }).then(function() {
    // eslint-disable-next-line
    console.log('Done.');
    db.shutdown();
  });