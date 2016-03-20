var exampleNote = require('../model/exampleNote');

// App seed
var defaultSeed = {
  users: {
    'testuser': {
      userId: 'testuser',
      name: 'Test User',
      loginKey: '1234',
      email: 'test@example.com'
    }
  },
  // TODO: that's a security issue
  sessions: {
    'user1token': {
      'userId': '1',
      'sessionToken': 'user1token'
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
    }
  },
  changes: {
    'note-1': exampleNote.createChangeset().map(function(c) {
      c.info = {
        userId: 'testuser'
      };
      return c;
    })
  }
};

module.exports = defaultSeed;