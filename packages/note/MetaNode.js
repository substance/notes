'use strict';

var DocumentNode = require('substance/model/DocumentNode');

/**
  Note metadata container, holds note's metadata
*/

function MetaNode() {
  Meta.super.apply(this, arguments);
}

DocumentNode.extend(MetaNode);

MetaNode.static.name = "meta";

MetaNode.static.defineSchema({
  title: { type: 'string', default: 'Untitled'}
});

module.exports = MetaNode;