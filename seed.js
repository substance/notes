'use strict';

var UserStore = require('./server/UserStore');
var SessionStore = require('./server/SessionStore');
var ChangeStore = require('./server/ChangeStore');
var DocumentStore = require('./server/DocumentStore');
var Database = require('./server/Database');
var seed = require('./data/defaultSeed');
var db = new Database();

// If dev option provided will use another seed file
if (process.argv[2] === 'dev') {
  seed = require('./data/devSeed');
  // eslint-disable-next-line
  console.log('Development seeding...');
}

db.reset() // Clear the database, set up the schema
  .then(function() {
    var userStore = new UserStore({ db: db });
    return userStore.seed(seed.users);
  }).then(function() {
    var sessionStore = new SessionStore({ db: db });
    return sessionStore.seed(seed.sessions);
  }).then(function() {
    var changeStore = new ChangeStore({db: db});
    return changeStore.seed(seed.changes);
  }).then(function() {
    var documentStore = new DocumentStore({db: db});
    return documentStore.seed(seed.documents);
  }).then(function() {
    // eslint-disable-next-line
    console.log('Done seeding.');
    db.shutdown();
  });