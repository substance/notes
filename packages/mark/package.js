
'use strict';

var Mark = require('./Mark');
var MarkTool = require('./MarkTool');
var MarkCommand = require('./MarkCommand');

module.exports = {
  name: 'mark',
  configure: function(config) {
    config.addNode(Mark);
    config.addTool(MarkTool);
    config.addCommand(MarkCommand);
    config.addIcon(Mark.static.name, {'fontawesome': 'fa-pencil'});
    config.addStyle(__dirname, '_mark');
  }
};