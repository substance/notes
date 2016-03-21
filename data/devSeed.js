var exampleNote = require('../model/exampleNote');

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
    }
  },
  // TODO: that's a security issue
  sessions: {
    'user1token': {
      'userId': 'testuser',
      'sessionToken': 'user1token'
    },
    'user2token': {
      'userId': 'testuser2',
      'sessionToken': 'user2token'
    }
  },
  documents: {
    'note-1': {
      documentId: 'note-1',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser'
      }
    },
    'note-2': {
      documentId: 'note-2',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser'
      }
    },
    'note-3': {
      documentId: 'note-3',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser'
      }
    },
    'note-4': {
      documentId: 'note-4',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2'
      }
    },
    'note-5': {
      documentId: 'note-5',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2'
      }
    },
    'note-6': {
      documentId: 'note-6',
      schemaName: 'substance-note',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 'testuser2'
      }
    }
  },
  changes: {
    'note-1': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser',
        createdAt: new Date()
      };
      return c;
    }),
    'note-2': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser2',
        createdAt: new Date()
      };
      return c;
    }),
    'note-3': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser2',
        createdAt: new Date()
      };
      return c;
    }),
    'note-4': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser',
        createdAt: new Date()
      };
      return c;
    }),
    'note-5': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser',
        createdAt: new Date()
      };
      return c;
    }),
    'note-6': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser',
        createdAt: new Date()
      };
      return c;
    })
  }
};

module.exports = devSeed;