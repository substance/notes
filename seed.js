var knexConfig = require('./knexfile');
var Storage = require('./hub/ChangesStore');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var CollabHub = require('substance/util/CollabHub');
var store = new Storage({config: knexConfig});

store.addChange('note-1', CollabHub.prototype.serializeChange(exampleNoteChangeset[0]), function(err, version){
	if(err) {
		console.log(err.message);
		process.exit(1);
	};
	console.log('Yay!');
	process.exit(0);
});