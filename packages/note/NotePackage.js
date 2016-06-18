'use strict';

var MetaNode = require('./MetaNode');
var SubstanceNote = require('./SubstanceNote');

module.exports = {
  name: 'note',
  configure: function(config) {
    config.defineSchema({
      name: 'substance-note',
      ArticleClass: SubstanceNote,
      defaultTextType: 'paragraph'
    });

    config.addNode(MetaNode);
  }
};