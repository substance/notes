var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 5000;
var server = require('substance/util/server');

// var hub = require('substance-hub');

// Serve app in development mode
// ----------------

server.serveStyles(app, '/app.css', path.join(__dirname, 'notepad', 'app.scss'));
server.serveJS(app, '/app.js', path.join(__dirname, 'notepad', 'app.js'));

app.use(express.static(path.join(__dirname, 'notepad')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

// // Connect Substance realtime hub
// ----------------

hub.connect(app, port);

// Export app for requiring in test files
module.exports = app;