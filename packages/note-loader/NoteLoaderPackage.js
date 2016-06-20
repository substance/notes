'use strict';

// Article Class
var Note = require('../note/NotePackage');

module.exports = {
  name: 'note-loader',
  configure: function(config) {
    config.import(Note);
  }
};