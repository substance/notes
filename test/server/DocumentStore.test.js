// 'use strict';

// require('../qunit_extensions');

// var backendSeed = require('substance/test/fixtures/collab/backendSeed');
// var DocumentStore = require('../../server/DocumentStore');

// var testDocumentStore = require('substance/test/collab/testDocumentStore');
// var twoParagraphs = require('substance/test/fixtures/collab/two-paragraphs');

// // TODO: Daniel, please require knexConfig directly from within the backend
// var backend = new Backend({
//   schemas: {
//     'prose-article': {
//       name: 'prose-article',
//       version: '1.0.0',
//       documentFactory: twoParagraphs
//     }
//   },
//   snapshotFrequency: 10
// });

// QUnit.module('server/SQLBackend', {
//   beforeEach: function(assert) {
//     var done = assert.async();
//     backend.seed(backendSeed, function(err) {
//       if (err) {
//         return console.error(err);
//       } else {
//         done();
//       }
//     });
//   }
// });

// QUnit.moduleDone(function() {
//   backend.shutdown();
// });

// // Runs the offical backend test suite
// testDocumentStore(backend, QUnit);
