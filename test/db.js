var Database = require('../server/Database');
Database.instance = new Database();

module.exports = Database.instance;