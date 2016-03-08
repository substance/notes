var exampleNote = require('../model/exampleNote');

// Fixture for backend
var defaultSeed = {
  users: {
    '1': {
      userId: '1',
      name: 'Demo',
      loginKey: '1234'
    }
  },
  documents: {
    'note-1': {
      documentId: 'note-1',
      userId: '1',
      schema: {
        name: 'substance-note',
        version: '1.0.0'
      },
      changes: exampleNote.createChangeset()
    }
  },
  // TODO: that's a security issue
  sessions: {
    'user1token': {
      'userId': '1',
      'sessionToken': 'user1token'
    }
  }
};


module.exports = defaultSeed;