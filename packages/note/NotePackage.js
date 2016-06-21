'use strict';

var MetaNode = require('./MetaNode');
var SubstanceNote = require('./SubstanceNote');

var ParagraphPackage = require('substance/packages/paragraph/ParagraphPackage');
var HeadingPackage = require('substance/packages/heading/HeadingPackage');
var CodeblockPackage = require('substance/packages/codeblock/CodeblockPackage');
var BlockquotePackage = require('substance/packages/blockquote/BlockquotePackage');
var ListPackage = require('substance/packages/list/ListPackage');
var LinkPackage = require('substance/packages/link/LinkPackage');
var EmphasisPackage = require('substance/packages/emphasis/EmphasisPackage');
var StrongPackage = require('substance/packages/strong/StrongPackage');
var CodePackage = require('substance/packages/code/CodePackage');

var CommentPackage = require('../comment/CommentPackage');
var MarkPackage = require('../mark/MarkPackage');
var TodoPackage = require('../todo/TodoPackage');

module.exports = {
  name: 'note',
  configure: function(config) {
    config.defineSchema({
      name: 'substance-note',
      ArticleClass: SubstanceNote,
      defaultTextType: 'paragraph'
    });

    config.addNode(MetaNode);

    config.import(ParagraphPackage);
    config.import(HeadingPackage);
    config.import(CodeblockPackage);
    config.import(BlockquotePackage);
    config.import(ListPackage);
    config.import(EmphasisPackage);
    config.import(StrongPackage);
    config.import(CodePackage);
    config.import(LinkPackage);

    // Import note specific packages
    config.import(CommentPackage);
    config.import(MarkPackage);
    config.import(TodoPackage);
  }
};