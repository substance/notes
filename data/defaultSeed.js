var exampleNoteChangeset = require('../model/exampleNoteChangeset')();

// Default seed for backend
var defaultSeed = {
  users: {
    'demo': {
      userId: 'demo',
      name: 'Demo user',
      loginKey: '1234'      
    }
  },
  changesets: {
    'note-1': exampleNoteChangeset
  }
};

module.exports = defaultSeed;