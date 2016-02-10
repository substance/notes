var store = require('./hub/ChangesStore');

var knexConfig = require('./db/knexfile');
var hub = require('./hub');

var storage = new hub.changesStore({config: knexConfig});
storage.init();

// Test cases:
// 
// Should be executed sequentially of course ;)

// Implicitly creates changeset for doc-1 and stores first change
store.addChange('doc-1', 'SERIALIZED_CHANGE', function(err, version) {
  // version = 1
});

store.addChange('doc-1', 'ANOTHER_CHANGE', function(err, version) {
  // version = 2
});

store.getVersion('doc-1', function(err, version) {
  // version = 2
});

// Get changes from the beginning (sinceVersion = 0) for doc-1
store.getChanges('doc-1', 0, function(err, changes, version) {
  // changes.length = 2
  // version = 2
});

store.deleteChangeset('doc-1', function(err) {
  // should wipe the changest
});

store.getVersion('doc-1', function(err, version) {
  // version should give an error (changeset does not exist)
});