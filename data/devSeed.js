'use strict';

var DocumentSession = require('substance/model/DocumentSession');
var Configurator = require('substance/util/Configurator');
var NotePackage = require('../packages/note/package');

var configurator = new Configurator().import(NotePackage);
var seed = configurator.getSeed();
var doc = configurator.createArticle();
var session = new DocumentSession(doc);
var change = session.transaction(seed);
var result = [change.toJSON()];

var testUserChange = result.map(function(c) {
  c.info = {
    userId: 'testuser',
    createdAt: new Date()
  };
  return c;
})[0];

var testUser2Change = result.map(function(c) {
  c.info = {
    userId: 'testuser2',
    createdAt: new Date()
  };
  return c;
})[0];

// App seed
var devSeed = {
  users: {
    'testuser': {
      userId: 'testuser',
      name: 'Test User',
      loginKey: '1234',
      email: 'test@example.com'
    },
    'testuser2': {
      userId: 'testuser2',
      name: 'Test User 2',
      loginKey: '12345',
      email: 'test2@example.com'
    },
    'testuser3': {
      userId: 'testuser3',
      name: '',
      loginKey: '123456',
      email: 'test3@example.com'
    }
  },
  sessions: {
  },
  documents: {
    'note-1': {
      documentId: 'note-1',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date()
      }
    },
    'note-2': {
      documentId: 'note-2',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date(),
        updatedBy: 'testuser2'
      }
    },
    'note-3': {
      documentId: 'note-3',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date()
      }
    },
    'note-4': {
      documentId: 'note-4',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date(),
        updatedBy: 'testuser2'
      }
    },
    'note-5': {
      documentId: 'note-5',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date()
      }
    },
    'note-6': {
      documentId: 'note-6',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2',
        title: doc.get(['meta', 'title']),
        updatedAt: new Date()
      }
    }
  },
  changes: {
    'note-1': [testUserChange],
    'note-2': [testUser2Change],
    'note-3': [testUser2Change],
    'note-4': [testUserChange],
    'note-5': [testUserChange],
    'note-6': [testUserChange]
  }
};

module.exports = devSeed;