var express = require('express');
var path = require('path');
var app = express();
var server = require('substance/util/server');
var CollabHub = require('substance/util/CollabHub');
var Storage = require('./hub/ChangesStore');
var http = require('http');
var WebSocketServer = require('ws').Server;

var api = require('./api');
var knexConfig = require('./knexfile');

var port = process.env.PORT || 5000;
var host = process.env.HOST || 'localhost';
var wsUrl = process.env.WS_URL || 'ws://'+host+':'+port;
var store = new Storage({config: knexConfig});

// If seed option provided we should remove db, run migration and seed script
if(process.argv[2] == 'seed') {
	var exec = require('child_process').exec;
	exec("rm -rf ./db/*.sqlite3 && knex migrate:latest && node seed");
}

// Serve app in development mode
// ----------------

server.serveStyles(app, '/app.css', path.join(__dirname, 'notepad', 'app.scss'));
server.serveJS(app, '/app.js', path.join(__dirname, 'notepad', 'app.js'));
var config = {
  host: host,
  port: port,
  wsUrl: wsUrl
};
server.serveHTML(app, '/', path.join(__dirname, 'notepad', 'index.html'), config);

app.use(express.static(path.join(__dirname, 'notepad')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

// Connect http api
app.use('/api', api(store));

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });

var hub = new CollabHub(wss, store);

// Delegate http requests to express app
httpServer.on('request', app);

// NOTE: binding to localhost means that the app is not exposed
// to the www directly.
// E.g. on sandbox.substance.io we have established a reverse proxy
// forwarding http+ws on notepad.substance.io to localhost:5001
httpServer.listen(port, 'localhost', function() { console.log('Listening on ' + httpServer.address().port); });

// Export app for requiring in test files
module.exports = app;
