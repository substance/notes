'use strict';

var substanceTest = require('substance/test/test').module('server/ChangeStore');

var changeStoreSeed = require('substance/test/fixtures/changeStoreSeed');
var Database = require('../../server/Database');
var db = new Database();
var ChangeStore = require('../../server/ChangeStore');
var changeStore = new ChangeStore({ db: db });

var testChangeStore = require('substance/test/collab/testChangeStore');

function setup() {
  return db.reset()
    .then(function() {
      var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
      return changeStore.seed(newChangeStoreSeed);
    });
}

function test(description, fn) {
  substanceTest(description, function(t) {
    setup().then(function(){
      fn(t);
    });
  });
}

// Runs the offical document store test suite
testChangeStore(changeStore, test);

// This is the end of test suite
test('Closing connection', function(t) {
  db.shutdown();
  t.end();
});