var knexConfig = require('./knexfile');
var Storage = require('./hub/ChangesStore');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var store = new Storage({config: knexConfig});

var change = exampleNoteChangeset[0].toJSON();

store.addChange('note-1', change).then(function(version) {
  console.log('ChangesStore successfully seeded. Version of example document: ', version);
  process.exit(0);
}, function(err) {
  console.error(err);
  process.exit(1);
});