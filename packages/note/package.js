'use strict';

var MetaNode = require('./MetaNode');
var Note = require('./Note');

var ParagraphPackage = require('substance/packages/paragraph/ParagraphPackage');
var HeadingPackage = require('substance/packages/heading/HeadingPackage');
var CodeblockPackage = require('substance/packages/codeblock/CodeblockPackage');
var BlockquotePackage = require('substance/packages/blockquote/BlockquotePackage');
var ListPackage = require('substance/packages/list/ListPackage');
var LinkPackage = require('substance/packages/link/LinkPackage');
var EmphasisPackage = require('substance/packages/emphasis/EmphasisPackage');
var StrongPackage = require('substance/packages/strong/StrongPackage');
var CodePackage = require('substance/packages/code/CodePackage');

var CommentPackage = require('../comment/package');
var MarkPackage = require('../mark/package');
var TodoPackage = require('../todo/package');

module.exports = {
  name: 'substance-note',
  configure: function(config) {
    config.defineSchema({
      name: 'substance-note',
      ArticleClass: Note,
      defaultTextType: 'paragraph'
    });
    config.addNode(MetaNode);

    // Import Substance Core packages
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