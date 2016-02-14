var express = require('express');
var path = require('path');
var app = express();
var server = require('substance/util/server');
var CollabHub = require('substance/util/CollabHub');
var Storage = require('./hub/ChangesStore');
var http = require('http');
var WebSocketServer = require('ws').Server;

var knexConfig = require('./knexfile');

var port = process.env.PORT || 5000;
var host = process.env.HOST || 'localhost';
var wsUrl = process.env.WS_URL || 'ws://'+host+':'+port;
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

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });

// Will be replaced with Daniel's persistent store
var store = new Storage({config: knexConfig});

var hub = new CollabHub(wss, store);

// Delegate http requests to express app
httpServer.on('request', app);

// FIXME: without specifying a host to bind to, the server gets bound to 0.0.0.0
// In production I'd rather want that bound to localhost
// however, the nginx websocket reverse proxy is not working yet
httpServer.listen(port, /*'localhost',*/ function() { console.log('Listening on ' + httpServer.address().port); });

// Export app for requiring in test files
module.exports = app;