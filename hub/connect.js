// Initialize knex connection
// --------------
// 

var Knex = require('knex');
var environment = process.env.NODE_ENV || 'development';
var config = knexConfig[environment];
if (!config) {
  throw new Error('Could not find config for environment', environment);
}

var connect = function(knexConfig) {
	var config = knexConfig[environment];
	if (!config) {
	  throw new Error('Could not find config for environment', environment);
	}
	return new Knex(config);
}

module.exports = connect;