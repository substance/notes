'use strict';

var DocumentNode = require('substance/model/DocumentNode');

/**
  Note metadata container, holds note's metadata
*/

function MetaNode() {
  MetaNode.super.apply(this, arguments);
}

DocumentNode.extend(MetaNode);

MetaNode.define({
  type: "meta",
  title: { type: 'string', default: 'Untitled'}
});

module.exports = MetaNode;