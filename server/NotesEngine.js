var oo = require('substance/util/oo');
var Err = require('substance/util/Error');
var union = require('lodash/union');

/*
  Implements the NotesEngine API.
*/
function NotesEngine(config) {
  this.config = config;
  this.db = config.db.connection;
}

NotesEngine.Prototype = function() {

  this.getDashboardDocs = function(userId, cb) {
    var self = this;

    this.getMyDocs(userId, function(err, myDocs) {
      if (err) {
        return cb(new Err('NotesEngine.ReadDashboardDocumentsError', {
          cause: err
        }));
      }

      self.getCollaboratedDocs(userId, function(err, collaboratedDocs) {
        if (err) {
          return cb(new Err('NotesEngine.ReadDashboardDocumentsError', {
            cause: err
          }));
        }
        var result = union(myDocs, collaboratedDocs);

        cb(null, result);
      });
    });
  };

  this.getMyDocs = function(userId, cb) {
    var query = "SELECT d.title, d.documentId, u.name as creator, (SELECT GROUP_CONCAT(name) FROM (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators, d.updatedAt, (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy FROM documents d INNER JOIN users u ON (d.userId = u.userId) WHERE d.userId = ? ORDER BY d.updatedAt DESC";

    this.db.raw(query, userId).asCallback(function(err, docs) {
      if (err) {
        return cb(new Err('NotesEngine.ReadMyDocumentsError', {
          cause: err
        }));
      }
      cb(null, docs);
    });
  };

  this.getCollaboratedDocs = function(userId, cb) {
    var query = "SELECT d.title, d.documentId, u.name as creator, (SELECT GROUP_CONCAT(name) FROM (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators, d.updatedAt, (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy FROM documents d INNER JOIN users u ON (d.userId = u.userId) WHERE d.documentId IN (SELECT documentId FROM changes WHERE userId = ?) AND d.userId != ? ORDER BY d.updatedAt DESC";

    this.db.raw(query, [userId, userId]).asCallback(function(err, docs) {
      if (err) {
        return cb(new Err('NotesEngine.ReadCollaboratedDocumentsError', {
          cause: err
        }));
      }
      cb(null, docs);
    });
  };
};

oo.initClass(NotesEngine);

module.exports = NotesEngine;