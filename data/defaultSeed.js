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
    'test-doc': {
      documentId: 'test-doc',
      schemaName: 'prose-article',
      schemaVersion: '1.0.0',
      version: 1,
      info: {
        userId: 1
      }
    }
  },
  changes: {
    'note-1': exampleNote.createChangeset()
  }
};

module.exports = defaultSeed;