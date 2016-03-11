var UserStore = require('./server/UserStore');
var SessionStore = require('./server/SessionStore');
var Database = require('./server/Database');
var seed = require('./data/defaultSeed');
var db = new Database();

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
    console.log('Done seeding.');
    db.shutdown();
  });