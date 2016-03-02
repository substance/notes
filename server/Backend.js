"use strict";

var fs = require('fs');
var path = require('path');
var each = require('lodash/each');
var async = require('async');
var connect = require('./connect');
var localFiles = require('./localFiles');
var EventEmitter = require('substance/util/EventEmitter');
var JSONConverter = require('substance/model/JSONConverter');
var _ = require('substance/util/helpers');
var uuid = require('substance/util/uuid');

/*
  Implements example of Substance Backend API.
*/
function Backend(config) {
  this.config = config;
  this.model = config.ArticleClass;
  this.storage = localFiles;
  this.connect();
  Backend.super.apply(this);
}

Backend.Prototype = function() {

  this.connect = function() {
    this.db = connect(this.config.knexConfig);
  };
  /*
    Gets changes from the DB.
    @param {String} id changeset id
    @param {String} sinceVersion changes since version (0 = all changes, 1 all except first change)
  */
  this.getChanges = function(id, sinceVersion, cb) {
    var self = this;
    var query = this.db('changes')
                .select('data', 'id')
                .where('changeset', id)
                .andWhere('pos', '>=', sinceVersion)
                .orderBy('pos', 'asc');

    query.asCallback(function(err, changes) {
      if (err) return cb(err);
      changes = _.map(changes, function(c) {return JSON.parse(c.data); });
      self.getVersion(id, function(err, headVersion) {
        return cb(null, headVersion, changes);
      });
    });
  };

  /*
    Add a change to a changeset. Implicitly creates a new changeset
    when the first change is added to
    @param {String} id changeset id
    @param {Object} change as JSON object
  */
  this.addChange = function(id, change, userId, cb) {
    var self = this;
    
    this.getVersion(id, function(err, headVersion) {
      if (err) return cb(err);
      var version = headVersion + 1;
      var record = {
        id: id + '/' + version,
        changeset: id,
        pos: version,
        data: JSON.stringify(change),
        timestamp: Date.now(),
        userId: userId
      };

      self.db.table('changes').insert(record)
        .asCallback(function(err) {
          if (err) return cb(err);
          cb(null, version);
        });
    });
  };

  /*
    Gets the version number for a document
  */
  this.getVersion = function(id, cb) {
    // HINT: version = count of changes
    // 0 changes: version = 0
    // 1 change:  version = 1
    var query = this.db('changes')
                .where('changeset', id)
                .count();
    query.asCallback(function(err, count) {
      if (err) return cb(err);
      return cb(null, count[0]['count(*)']);
    });
  };

  /*
    Removes a changeset from the db
    @param {String} id changeset id
  */
  this.deleteDocument = function(id, cb) {
    var query = this.db('changes')
                .where('changeset', id)
                .del();
    query.asCallback(function(err) {
      return cb(err);
    });
  };

  /*
    Get latest snapshot of document
    @param {String} id changeset id

    TODO: we should find a way to optimize this.
  */
  this.getDocument = function(id, cb) {
    var self = this;
    this.getChanges(id, 0, function(err, version, changes) {
      if(err) return cb(err);
      var doc = new self.model();
      _.each(changes, function(change) {
        _.each(change.ops, function(op){
          doc.data.apply(op);
        });
      });

      var converter = new JSONConverter();
      cb(null, converter.exportDocument(doc), version);
    });
  };

  /*
    Create a new user record (aka signup)

    @param {Object} userData contains name property
  */
  this.createUser = function(userData, cb) {
    var self = this;

    this._createUser(userData, function(err, user) {
      if(err) return cb(err);
      self._createSession(user.userId, function(err, session) {
        if(err) return cb(err);

        // Make session rich
        session.user = user;
        cb(null, {
          session: session,
          loginKey: user.loginKey
        });
      });
    });
  };

  /*
    Get user record for a given userId
  */
  this.getUser = function(userId, cb) {
    var query = this.db('users')
                .where('userId', userId);

    query.asCallback(function(err, user) {
      if (err) return cb(err);
      user = user[0]; // query result is an array
      if (!user) return cb(new Error('No user found for userId '+userId));
      cb(null, user);
    });
  };

  /*
    Checks given login data and creates an entry in the session store for valid logins
    Returns a an object with a user record and a session token
  */
  this.authenticate = function(loginData, cb) {
    console.log('loginData', loginData);
    if (loginData.sessionToken) {
      this._authenticateWithToken(loginData.sessionToken, cb);
    } else {
      this._authenticateWithLoginKey(loginData.loginKey, cb);
    }
  };

  /*
    Creates a new user session based on an existing sessionToken
  */
  this._authenticateWithToken = function(sessionToken, cb) {
    var self = this;
    this._getSession(sessionToken, function(err, session) {
      if (err) return cb(new Error('No session found for '+sessionToken));
      // Delete existing session and create a new one
      self._createSessionFromOldSession(session, cb);
    });
  };

  /*
    Refreshes session for an authenticated user

    Returns a rich session including a user object
  */
  this._createSessionFromOldSession = function(oldSession, cb) {
    var self = this;
    this._deleteSession(oldSession.sessionToken, function(err) {
      if (err) return cb(err);
      self._createSession(oldSession.userId, function(err, session) {
        if (err) return cb(err);
        self._getRichSession(session, cb);
      });
    });
  };

  this._deleteSession = function(sessionToken, cb) {
    // We just skip that for now
    cb(null);
  };

  /*
    Authenicate based on login key
  */
  this._authenticateWithLoginKey = function(loginKey, cb) {
    var self = this;
    this._getUserByLoginKey(loginKey, function(err, user) {
      if (err) return cb(err);
      self._createSession(user.userId, function(err, session) {
        if (err) return cb(err);
        session.user = user;
        cb(null, session);
      });
    });
  };

  /*
    Get session entry based on a sessionToken
  */
  this.getSession = function(sessionToken, cb) {
    this._getSession(sessionToken, function(err, session) {
      if (err) return cb(err);
      this._getRichSession(session, cb);
    }.bind(this));
  };

  /*
    Returns middleware for file uploading
  */
  this.getFileUploader = function(fieldname) {
    return this.storage.uploader.single(fieldname);
  };

  /*
    Get name of stored file
  */
  this.getFileName = function(req) {
    return req.file.filename;
  };

  /*
    Internal method to create a session record
  */
  this._createSession = function(userId, cb) {
    var newSession = {
      sessionToken: uuid(),
      timestamp: Date.now(),
      userId: userId
    };

    this.db.table('sessions').insert(newSession)
      .asCallback(function(err) {
        if (err) return cb(err);
        cb(null, newSession);
      });
  };

  this._getSession = function(sessionToken, cb) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken);

    query.asCallback(function(err, session) {
      if (err) return cb(err);
      session = session[0]; // query result is an array
      if (!session) return cb(new Error('No session found for that token'));
      cb(null, session);
    });
  };

  /*
    Get user record for a given loginKey
  */
  this._getUserByLoginKey = function(loginKey, cb) {
    var query = this.db('users')
                .where('loginKey', loginKey);

    query.asCallback(function(err, user) {
      if (err) return cb(err);
      user = user[0]; // query result is an array
      if (!user) return cb(new Error('Your provided login key was invalid.'));
      cb(null, user);
    });
  };

  /*
    Internal method to create a user entry
  */
  this._createUser = function(userData, cb) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();
    var user = {
      name: userData.name,
      createdAt: Date.now(),
      loginKey: loginKey
    };

    this.db.table('users').insert(user)
      .asCallback(function(err, userIds) {
        if (err) return cb(err);
        // Takes the auto-incremented userId
        user.userId = userIds[0];

        cb(null, user);
      });
  };

  /*
    Just turns the session db record into an expanded version that contains
    the complete user record.
  */
  this._getRichSession = function(session, cb) {
    this.getUser(session.userId, function(err, user) {
      if (err) return cb(err);
      session.user = user;
      cb(null, session);
    });
  };

  /*
    Disconnect from the db and shut down
  */
  this.shutdown = function(cb) {
    this.db.destroy(cb);
  };

  /*
    Remove sqlite file for current environment
  */
  this.cleanDb = function(cb) {
    var self = this;

    // Close db connection
    this.shutdown(function() {
      var env = process.env.NODE_ENV || 'development';
      var filePath = path.resolve(self.config.knexConfig[env].connection.filename);
      fs.stat(filePath, function(err, stats) {
        // Remove db file if it is exists
        if(stats) fs.unlink(filePath);
        // Establish new connection with db
        self.connect();
        cb(null);
      });
    });
  };

  /*
    Run migrations
  */
  this.runMigration = function(cb) {
    this.db.migrate.latest({directory: './db/migrations'}).asCallback(function(err){
      if(err) return cb(err);
      cb(null);
    });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production
  */
  this.seed = function(seed, cb) {
    var self = this;

    this.connect();

    function wipe(callback) {
      self.cleanDb.call(self, callback);
    }

    function migrate(callback) {
      self.runMigration.call(self, callback);
    }

    function seedUsers(callback) {
      async.eachSeries(seed.users, function(user, callback) {
        self.createUser(user, callback);
      }, callback);
    }

    function seedDocuments(callback) {
      async.eachSeries(seed.documents, function(data, callback) {
        self.addChange(data.id, data.document, 1, callback);
      }, callback);
    }

    function prepareSeed(callback) {
      each(seed.documents, function(document, id) {
        var result = {
          document: document,
          id: id,
        };
        seed.documents[id] = result;
      });
      callback(null);
    }

    async.series([
      wipe,
      migrate,
      prepareSeed,
      seedUsers,
      seedDocuments
      ], function(err) {
      if (err) return cb(err);
      cb(null);
    });
  };

};

EventEmitter.extend(Backend);

module.exports = Backend;