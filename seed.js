var async = require('async');
var knexConfig = require('./knexfile');
var Backend = require('./hub/Backend');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var backend = new Backend({config: knexConfig});
var change = exampleNoteChangeset[0].toJSON();
var user = {
  loginKey: '1234',
  name: 'Substance Bot'
}

var seedChanges = function(cb) {
	backend.addChange('note-1', change, function(err, version) {
		if(err) return cb(err);
		console.log('Changes successfully seeded. Version of example document: ', version);
		cb(null);
	});
}

var seedUsersAndSessions = function(cb) {
	backend.createUser(user, function(err, session) {
		if(err) return cb(err);
		console.log('User and session successfully seeded. Use following login key to access notepad:', session.loginKey ,'. Session Id: ', session.sessionToken);
		cb(null);
	});
}

async.series([
	seedChanges,
	seedUsersAndSessions
], function(err, results) {
	if(err) {
    console.log(err.message);
    process.exit(1);
  };
  console.log('Seeding has been completed!');
  process.exit(0);
});