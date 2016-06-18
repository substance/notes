'use strict';

var Mark = require('./Mark');
var MarkTool = require('./MarkTool');
var MarkCommmand = require('./MarkCommmand');

module.exports = {
  name: 'mark',
  configure: function(config) {
    config.addNode(Mark);
    config.addTool(MarkTool);
    config.addCommand(MarkCommmand);
  }
};