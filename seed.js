var knexConfig = require('./knexfile');
var Storage = require('./hub/ChangesStore');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var store = new Storage({config: knexConfig});

store.addChange('note-1', exampleNoteChangeset, function(err, version){
	if(err) {
		console.log(err.message);
		process.exit(1);
	};
	console.log('Yay!');
	process.exit(0);
});