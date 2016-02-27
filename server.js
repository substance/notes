var express = require('express');
var path = require('path');
var app = express();
var server = require('substance/util/server');
var CollabHub = require('substance/collab/CollabHub');
var Backend = require('./hub/Backend');
var bodyParser = require('body-parser');
var http = require('http');
var WebSocketServer = require('ws').Server;
var knexConfig = require('./knexfile');

var port = process.env.PORT || 5000;
var host = process.env.HOST || 'localhost';
var wsUrl = process.env.WS_URL || 'ws://'+host+':'+port;

var backend = new Backend({
  knexConfig: knexConfig,
  ArticleClass: require('./note/Note.js')
});

// If seed option provided we should remove db, run migration and seed script
if(process.argv[2] == 'seed') {
	var execSync = require('child_process').execSync;
	execSync("rm -rf ./db/*.sqlite3 && knex migrate:latest && node seed");
  console.log('Seeding the db...');
}

/*
  Serve app in development mode
*/
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '3mb', parameterLimit: 3000 }));

/*
  Serve HTML, bundled JS and CSS
*/
var config = {
  host: host,
  port: port,
  wsUrl: wsUrl
};
server.serveHTML(app, '/', path.join(__dirname, 'notepad', 'index.html'), config);
server.serveStyles(app, '/app.css', path.join(__dirname, 'notepad', 'app.scss'));
server.serveJS(app, '/app.js', path.join(__dirname, 'notepad', 'app.js'));


/*
  Serve static files
*/
app.use(express.static(path.join(__dirname, 'notepad')));
app.use('/media', express.static(path.join(__dirname, 'uploads')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });
var hub = new CollabHub(wss, backend);

// Adds http routes that CollabHub implements
hub.addRoutes(app);


// Error handling
// We send JSON to the client so they can display messages in the UI.
app.use(function(err, req, res, next) {
  res.status(500).json({errorMessage: err.message});
});

// Delegate http requests to express app
httpServer.on('request', app);

// NOTE: binding to localhost means that the app is not exposed
// to the www directly.
// E.g. on sandbox.substance.io we have established a reverse proxy
// forwarding http+ws on notepad.substance.io to localhost:5001
httpServer.listen(port, 'localhost', function() {
  console.log('Listening on ' + httpServer.address().port); 
});


// Export app for requiring in test files
module.exports = app;
