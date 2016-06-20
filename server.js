var config = require('config');
var express = require('express');
var path = require('path');
var app = express();
var server = require('substance/util/server');
var newNote = require('./model/newNote');
var CollabServer = require('substance/collab/CollabServer');
var DocumentChange = require('substance/model/DocumentChange');
var DocumentEngine = require('./server/NotesDocumentEngine');
var DocumentStore = require('./server/DocumentStore');
var ChangeStore = require('./server/ChangeStore');
var UserStore = require('./server/UserStore');
var SessionStore = require('./server/SessionStore');
var AuthenticationServer = require('./server/AuthenticationServer');
var DocumentServer = require('./server/NotesDocumentServer');
var AuthenticationEngine = require('./server/AuthenticationEngine');
var FileStore = require('./server/FileStore');
var FileServer = require('./server/FileServer');
var NotesServer = require('./server/NotesServer');
var NotesEngine = require('./server/NotesEngine');
var Database = require('./server/Database');
var bodyParser = require('body-parser');
var http = require('http');
var WebSocketServer = require('ws').Server;

var db = new Database();

// Set up stores
// -------------------------------

var userStore = new UserStore({ db: db });
var sessionStore = new SessionStore({ db: db });

// We use the in-memory versions for now, thus we need to seed
// each time.
var changeStore = new ChangeStore({db: db});
var documentStore = new DocumentStore({db: db});

var fileStore = new FileStore({destination: './uploads'});

var documentEngine = new DocumentEngine({
  db: db,
  documentStore: documentStore,
  changeStore: changeStore,
  schemas: {
    'substance-note': {
      name: 'substance-note',
      version: '1.0.0',
      documentFactory: newNote
    }
  }
});

var authenticationEngine = new AuthenticationEngine({
  userStore: userStore,
  sessionStore: sessionStore,
  emailService: null // TODO
});

var notesEngine = new NotesEngine({db: db});

/*
  Express body-parser configureation 
*/
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '3mb', parameterLimit: 3000 }));

/*
  Serve app
*/
var env = config.util.getEnv('NODE_ENV');
var config = config.get('server');

if(env !== 'production') {
  // Serve HTML, bundled JS and CSS in non-production mode
  server.serveHTML(app, '/', path.join(__dirname, 'client/index.html'), config);
  server.serveStyles(app, '/app.css', path.join(__dirname, 'client/app.scss'));
  server.serveJS(app, '/app.js', path.join(__dirname, 'client/app.js'));
  // Serve static files in non-production mode
  app.use('/assets', express.static(path.join(__dirname, 'styles/assets')));
  app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));
} else {
  app.use('/', express.static(path.join(__dirname, '/dist')));
}

/*
  Serve uploads directory
*/
app.use('/media', express.static(path.join(__dirname, 'uploads')));

// Connect Substance
// ----------------

var httpServer = http.createServer();
var wss = new WebSocketServer({ server: httpServer });

// DocumentServer
// ----------------

var documentServer = new DocumentServer({
  documentEngine: documentEngine,
  path: '/api/documents'
});
documentServer.bind(app);


// CollabServer
// ----------------

var collabServer = new CollabServer({
  documentEngine: documentEngine,

  /*
    Checks for authentication based on message.sessionToken
  */
  authenticate: function(req, cb) {
    var sessionToken = req.message.sessionToken;
    authenticationEngine.getSession(sessionToken).then(function(session) {
      cb(null, session);
    }).catch(function(err) {
      cb(err);
    });
  },

  /*
    Will store the userId along with each change. We also want to build
    a documentInfo object to update the document record with some data
  */
  enhanceRequest: function(req, cb) {
    var message = req.message;
    if (message.type === 'sync') {
      // We fetch the document record to get the old title
      documentStore.getDocument(message.documentId, function(err, docRecord) {
        var updatedAt = new Date();
        var title = docRecord.title;

        if (message.change) {
          // Update the title if necessary
          var change = DocumentChange.fromJSON(message.change);
          change.ops.forEach(function(op) {
            if(op.path[0] == 'meta' && op.path[1] == 'title') {
              title = op.diff.apply(title);
            }
          });

          message.change.info = {
            userId: req.session.userId,
            updatedAt: updatedAt
          };
        }

        message.collaboratorInfo = {
          name: req.session.user.name
        };

        // commit and connect method take optional documentInfo argument
        message.documentInfo = {
          updatedAt: updatedAt,
          updatedBy: req.session.userId,
          title: title
        };
        cb(null);
      });
    } else {
      // Just continue for everything that is not handled
      cb(null);
    }
  }
});

collabServer.bind(wss);

// Set up AuthenticationServer
// ----------------

var authenticationServer = new AuthenticationServer({
  authenticationEngine: authenticationEngine,
  path: '/api/auth/'
});

authenticationServer.bind(app);

// NotesServer
// ----------------

var notesServer = new NotesServer({
  notesEngine: notesEngine,
  path: '/api/notes'
});
notesServer.bind(app);

// Substance Notes API
// ----------------
// 
// We just moved that out of the Collab hub as it's app specific code

var fileServer = new FileServer({
  store: fileStore,
  path: '/api/files'
});
fileServer.bind(app);


// Error handling
// We send JSON to the client so they can display messages in the UI.

/* jshint unused: false */
app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  
  if (err.inspect) {
    // This is a SubstanceError where we have detailed info
    console.error(err.inspect());
  } else {
    // For all other errors, let's just print the stack trace
    console.error(err.stack);
  }
  
  res.status(500).json({
    errorName: err.name,
    errorMessage: err.message || err.name
  });
});

// Delegate http requests to express app
httpServer.on('request', app);

// NOTE: binding to localhost means that the app is not exposed
// to the www directly.
// E.g. on sandbox.substance.io we have established a reverse proxy
// forwarding http+ws on notepad.substance.io to localhost:5001
httpServer.listen(config.port, config.host, function() {
  console.log('Listening on ' + httpServer.address().port); 
});

// Export app for requiring in test files
module.exports = app;
