'use strict';

var oo = require('substance/util/oo');
var Err = require('substance/util/SubstanceError');

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
      } else {
        // Turn comma separated values into array
        doc.collaborators = doc.collaborators.split(',');
      }
      if (!doc.creator) {
        doc.creator = 'Anonymous';
      }
      doc.documentId = doc.document_id;
      doc.updatedBy = doc.updated_by || 'Anonymous';
      doc.updatedAt = doc.updated;
    });
    return docs;
  };

  this.getUserDashboard = function(userId, cb) {

    var userDocsQuery = "(SELECT \
      d.title as title, \
      d.document_id as document_id, \
      u.name as creator, \
      (SELECT string_agg(name, ',') \
        FROM (SELECT DISTINCT u.name FROM changes c INNER JOIN users u ON (c.user_id = u.user_id) WHERE c.document_id = d.document_id AND c.user_id != d.user_id) AS authors \
      ) AS collaborators, \
      d.updated as updated, \
      (SELECT name FROM users WHERE user_id=d.updated_by) AS updated_by \
    FROM documents d \
    INNER JOIN users u ON (d.user_id = u.user_id) \
    WHERE d.user_id = $1)";

    var collabDocsQuery = "(SELECT \
      d.title as title, \
      d.document_id as document_id, \
      u.name as creator, \
      (SELECT string_agg(name, ',') \
        FROM (SELECT DISTINCT u.name FROM changes c INNER JOIN users u ON (c.user_id = u.user_id) WHERE c.document_id = d.document_id AND c.user_id != d.user_id) AS authors \
      ) AS collaborators, \
      d.updated as updated, \
      (SELECT name FROM users WHERE user_id=d.updated_by) AS updated_by \
    FROM documents d \
    INNER JOIN users u ON (d.user_id = u.user_id) \
    WHERE d.document_id IN (SELECT document_id FROM changes WHERE user_id = $1) AND d.user_id != $1 ORDER BY d.updated DESC)";

    // Combine the two queries
    var query = [userDocsQuery, 'UNION', collabDocsQuery].join(' ');

    this.db.run(query, [userId], function(err, docs) {
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