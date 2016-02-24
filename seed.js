var async = require('async');
var knexConfig = require('./knexfile');
var Backend = require('./hub/Backend');
var exampleNoteChangeset = require('./note/exampleNoteChangeset')();
var backend = new Backend({knexConfig: knexConfig});
var change = exampleNoteChangeset[0].toJSON();

var user = {
  loginKey: '1234',
  name: 'Demo User'
};

function seedChanges(cb) {
	backend.addChange('note-1', change, 1, function(err, version) {
		if(err) return cb(err);
		console.log('Changes successfully seeded. Version of example document: ', version);
		cb(null);
	});
}

function seedUsersAndSessions(cb) {
	backend.createUser(user, function(err, session) {
		if(err) return cb(err);
		console.log(session);
		console.log(
      'User and session successfully seeded. Use following login key to access notepad:',
      session.loginKey ,
      '. Session Id: ',
      session.session.sessionToken
    );
		cb(null);
	});
}

async.series([
	seedUsersAndSessions,
	seedChanges
], function(err) {
	if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log('Seeding has been completed!');
  process.exit(0);
});