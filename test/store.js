var knexConfig = require('./../knexfile');
var storage = require('../hub/ChangesStore');
var assert = require('assert');

var store = new storage({config: knexConfig});

describe('Hub storage', function() {
  describe('add change', function () {
    it('should return no errors and version 1', function (done) {
      store.addChange('doc-1', 'SERIALIZED_CHANGE', function(err, version) {
      	if (err) return done(err);
			  assert.equal(1, version);
			  done();
			});
    });
    it('should return no errors and version 2', function (done) {
      store.addChange('doc-1', 'SERIALIZED_CHANGE', function(err, version) {
      	if (err) return done(err);
			  assert.equal(2, version);
			  done();
			});
    });
  });

  describe('get version', function () {
  	it('should return no errors and version 2', function (done) {
			store.getVersion('doc-1', function(err, version) {
      	if (err) return done(err);
			  assert.equal(2, version);
			  done();
			});
    });
  });

  describe('get changes', function () {
  	it('should return no errors, array of 2 changes and version 2', function (done) {
			store.getChanges('doc-1', 0, function(err, changes, version) {
      	if (err) return done(err);
			  assert.equal(2, changes.length);
			  assert.equal(2, version);
			  done();
			});
    });
  });

  describe('delete changeset', function () {
  	it('should wipe the changest', function (done) {
			store.deleteChangeset('doc-1', function(err) {
      	done(err);
			});
    });
  	it('version should be 0', function (done) {
			store.getVersion('doc-1', function(err, version) {
				if (err) return done(err);
				assert.equal(0, version);
      	done();
			});
    });
  });
});