'use strict';

var NoteLoader = require('../note-loader/NoteLoaderPackage');
var NoteReader = require('../note-reader/NoteReaderPackage');
var NoteWriter = require('../note-writer/NoteWriterPackage');

module.exports = {
  name: 'notes',
  configure: function(config) {
    config.import(NoteLoader);
    config.import(NoteReader);
    config.import(NoteWriter);
  }
};