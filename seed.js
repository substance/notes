var UserStore = require('./server/UserStore');
var SessionStore = require('./server/SessionStore');
var ChangeStore = require('./server/ChangeStore');
var DocumentStore = require('./server/DocumentStore');
var Database = require('./server/Database');
var seed = require('./data/defaultSeed');
var db = new Database();
var defaultSeed = require('./data/defaultSeed');

// Clear the database and setup the schema
// TODO: Also seed change store and document store once ready
db.reset()
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
    console.log('Done seeding.');
    db.shutdown();
  });