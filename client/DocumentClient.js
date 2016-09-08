'use strict';

var DocumentClient = require('substance/collab/DocumentClient');
var request = require('substance/util/request');

/*
  HTTP client for talking with DocumentServer
*/

function NotesDocumentClient() {
  NotesDocumentClient.super.apply(this, arguments);
}

NotesDocumentClient.Prototype = function() {

  this.listUserDashboard = function(userId, cb) {
    request('GET', '/api/notes/dashboard/user/'+userId, null, cb);
  };

};

DocumentClient.extend(NotesDocumentClient);

module.exports = NotesDocumentClient;
