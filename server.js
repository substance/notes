var knexConfig = require('./db/knexfile');
var hub = require('./hub');

var storage = new hub.changesStore({config: knexConfig});
storage.init();