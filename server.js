var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 5000;
var server = require('substance/util/server');
var Hub = require('substance/util/StubHub');
var TestStore = require('substance/util/TestStore');
var http = require('http');
var WebSocketServer = require('ws').Server;
var exampleNoteChangeset = require('./note/exampleNoteChangeset');

// Serve app in development mode
// ----------------

server.serveStyles(app, '/app.css', path.join(__dirname, 'notepad', 'app.scss'));
server.serveJS(app, '/app.js', path.join(__dirname, 'notepad', 'app.js'));

app.use(express.static(path.join(__dirname, 'notepad')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });

// Will be replaced with Daniel's persistent store
var store = new TestStore({
  'note-1': exampleNoteChangeset()
});

var hub = new Hub(wss, store);

// Delegate http requests to express app
httpServer.on('request', app);

httpServer.listen(port, function() { console.log('Listening on ' + httpServer.address().port); });

// Export app for requiring in test files
module.exports = app;
