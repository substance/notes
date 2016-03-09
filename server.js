var express = require('express');
var path = require('path');
var app = express();
var server = require('substance/util/server');
var exampleNote = require('./model/exampleNote');
var CollabServer = require('substance/collab/CollabServer');
var DocumentStore = require('./server/DocumentStore');
var UserStore = require('./server/UserStore');
var SessionStore = require('./server/SessionStore');

var AuthenticationServer = require('./server/AuthenticationServer');
var AuthenticationEngine = require('./server/AuthenticationEngine');
var Database = require('./server/Database');

var bodyParser = require('body-parser');
var http = require('http');
var WebSocketServer = require('ws').Server;

var port = process.env.PORT || 5000;
var host = process.env.HOST || 'localhost';
var wsUrl = process.env.WS_URL || 'ws://'+host+':'+port;
var db = new Database();

// If seed option provided we should remove db, run migration and seed script
if(process.argv[2] == 'seed') {
  var execSync = require('child_process').execSync;
  execSync("node seed");
  console.log('Seeding the db...');
}

// Set up stores
// -------------------------------

var documentStore = new DocumentStore({
  db: db,
  schemas: {
    'substance-note': {
      name: 'substance-note',
      version: '1.0.0',
      documentFactory: exampleNote
    }
  }
});

var userStore = new UserStore({ db: db });
var sessionStore = new SessionStore({ db: db });

var authenticationEngine = new authenticationEngine({
  userStore: userStore,
  sessionStore: sessionStore,
  emailService: null // TODO
});


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
server.serveHTML(app, '/', path.join(__dirname, 'index.html'), config);
server.serveStyles(app, '/app.css', path.join(__dirname, 'app.scss'));
server.serveJS(app, '/app.js', path.join(__dirname, 'app.js'));

/*
  Serve static files
*/
// app.use(express.static(path.join(__dirname, 'notepad')));
app.use('/media', express.static(path.join(__dirname, 'uploads')));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });

// Set up collab server
// ----------------

var collabServer = new CollabServer({documentStore: documentStore});
collabServer.bind(wss);

var authenticationServer = new AuthenticationServer({
  authenticationEngine: authenticationEngine
  path: '/api/auth',
});

authenticationServer.bind(app);

// Substance Notes API
// ----------------
// 
// We just moved that out of the Collab hub as it's app specific code


// Should go into DocumentServer module
// ----------------

app.get('/hub/api/documents/:id', function(req, res, next) {

  documentStore.getSnapshot(req.params.id, function(err, doc, version) {
    if(err) return next(err);
    res.json({
      document: doc,
      version: version
    });
  });
});

// app.post('/hub/api/upload', backend.getFileUploader('files'), function(req, res) {
//   res.json({name: backend.getFileName(req)});
// });

// Error handling
// We send JSON to the client so they can display messages in the UI.

app.use(function(err, req, res, next) {
  console.log('Server error: ', err);
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
