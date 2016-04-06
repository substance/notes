var oo = require('substance/util/oo');
var Err = require('substance/util/Error');

/*
  Implements the NotesEngine API.
*/
function NotesEngine(config) {
  this.config = config;
  this.db = config.db.connection;
}

NotesEngine.Prototype = function() {
  
  this._enhanceDocs = function(docs) {
    docs.forEach(function(doc) {
      if (!doc.collaborators) {
        doc.collaborators = [];
      }
      if (!doc.creator) {
        doc.creator = 'Anonymous';
      }
      if (!doc.updatedBy) {
        doc.updatedBy = 'Anonymous';
      }
    });
    return docs;
  };

  this.getUserDashboard = function(userId, cb) {

    var userDocsQuery = "SELECT d.title as title, d.documentId as documentId, u.name as creator, (SELECT GROUP_CONCAT(name) FROM (SELECT DISTINCT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators, d.updatedAt as updatedAt, (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy FROM documents d INNER JOIN users u ON (d.userId = u.userId) WHERE d.userId = :userId";
    var collabDocsQuery = "SELECT d.title as title, d.documentId as documentId, u.name as creator, (SELECT GROUP_CONCAT(name) FROM (SELECT DISTINCT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators, d.updatedAt as updatedAt, (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy FROM documents d INNER JOIN users u ON (d.userId = u.userId) WHERE d.documentId IN (SELECT documentId FROM changes WHERE userId = :userId) AND d.userId != :userId ORDER BY d.updatedAt DESC";

    // Combine the two queries
    var query = [userDocsQuery, 'UNION', collabDocsQuery].join(' ');

    this.db.raw(query, {userId: userId}).asCallback(function(err, docs) {
      if (err) {
        return cb(new Err('ReadError', {
          cause: err
        }));
      }
      cb(null, this._enhanceDocs(docs));
    }.bind(this));
  };
};

oo.initClass(NotesEngine);

module.exports = NotesEngine;