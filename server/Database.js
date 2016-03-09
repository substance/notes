'use strict';

var oo = require('substance/util/oo');
var Knex = require('knex');
var knexConfig = require('../knexfile');
var env = process.env.NODE_ENV || 'development';

/*
  Implements Database Conection API.
*/
function Database() {
  this.connect();
}

Database.Prototype = function() {

  /*
    Connect to the db
  */
  this.connect = function() {
    this.config = knexConfig[env];
    if (!this.config) {
      throw new Error('Could not find config for environment', env);
    }
    this.connection = new Knex(this.config);
  };

  /*
    Disconnect from the db and shut down
  */
  this.shutdown = function(cb) {
    this.connection.destroy(cb);
  };


  /*
    Wipe DB and run lagtest migartion

    @param {Function} cb callback
  */
  this.reset = function() {
    var self = this;

    return self.connection.schema
      .dropTableIfExists('changes')
      .dropTableIfExists('documents')
      .dropTableIfExists('sessions')
      .dropTableIfExists('users')
      // We should drop migrations table 
      // to rerun the same migration again
      .dropTableIfExists('knex_migrations')
      .then(function() {
        return self.connection.migrate.latest(self.config);
      }).catch(function(error) {
        console.error(error);
      });
  };

};

oo.initClass(Database);

module.exports = Database;
