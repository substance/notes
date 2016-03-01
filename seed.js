var knexConfig = require('./knexfile');
var Backend = require('./server/Backend');
var defaultSeed = require('./data/defaultSeed');
var backend = new Backend({knexConfig: knexConfig});

backend.seed(defaultSeed, function(err) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }
  console.log('Seeding has been completed!');
  process.exit(0);
});