var knexConfig = require('./knexfile');
var Storage = require('./hub/ChangesStore');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var store = new Storage({config: knexConfig});
var change = exampleNoteChangeset[0].toJSON();

store.addChange('note-1', change, function(err, version) {
  if(err) {
    console.log(err.message);
    process.exit(1);
  };
  console.log('ChangesStore successfully seeded. Version of example document: ', version);
  process.exit(0);
});
