'use strict';

require('../qunit_extensions');

var knexConfig = require('../../knexfile');
var backendSeed = require('substance/test/fixtures/collab/backendSeed');
var Backend = require('../../server/Backend');

var backend = new Backend({
  knexConfig: knexConfig,
  ArticleClass: require('substance/packages/prose-editor/ProseArticle')
});

QUnit.module('server/Backend', {
  beforeEach: function(assert) {
    var done = assert.async();
    backend.seed(backendSeed, function(err) {
      if (err) {
        return console.error(err);
      } else {
        done();
      }
    });
  }
});

// TODO: run Substance backend tests

QUnit.test("Test backend 1", function(assert) {
  assert.ok(true, 'NOEZ');
});

QUnit.test("Test backend 2", function(assert) {
  assert.ok(true, 'NAH');

  backend.shutdown();
});


// TODO: convert to QUnit, but first we need Substance test setup
// ------------------
// 
// describe('Hub storage', function() {
//   describe('add change', function () {
//     it('should return no errors and version 1', function (done) {
//       store.addChange('doc-1', 'SERIALIZED_CHANGE', function(err, version) {
//         if (err) return done(err);
//         assert.equal(1, version);
//         done();
//       });
//     });
//     it('should return no errors and version 2', function (done) {
//       store.addChange('doc-1', 'SERIALIZED_CHANGE', function(err, version) {
//         if (err) return done(err);
//         assert.equal(2, version);
//         done();
//       });
//     });
//   });

//   describe('get version', function () {
//     it('should return no errors and version 2', function (done) {
//       store.getVersion('doc-1', function(err, version) {
//         if (err) return done(err);
//         assert.equal(2, version);
//         done();
//       });
//     });
//   });

//   describe('get changes', function () {
//     it('should return no errors, array of 2 changes and version 2', function (done) {
//       store.getChanges('doc-1', 0, function(err, changes, version) {
//         if (err) return done(err);
//         assert.equal(2, changes.length);
//         assert.equal(2, version);
//         done();
//       });
//     });
//   });

//   describe('delete changeset', function () {
//     it('should wipe the changest', function (done) {
//       store.deleteChangeset('doc-1', function(err) {
//         done(err);
//       });
//     });
//     it('version should be 0', function (done) {
//       store.getVersion('doc-1', function(err, version) {
//         if (err) return done(err);
//         assert.equal(0, version);
//         done();
//       });
//     });
//   });
// });