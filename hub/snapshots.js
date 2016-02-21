var Note = require('../note/Note');
var Snapshot = require('./Snapshot');
var Snapshots = {};

var getSnapshot = function(req, res, next) {
  snapshot.get(req.params.id, function(err, doc, version) {
    if(err) return next(err);
    res.json([doc, version]);
  });
};

Snapshots.connect = function(backend) {
  snapshot = new Snapshot(backend, Note);
};

Snapshots.addRoutes = function(app) {
  app.get('/hub/api/snapshot/:id', getSnapshot);
};

module.exports = Snapshots;