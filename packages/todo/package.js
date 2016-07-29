'use strict';

var Todo = require('./Todo');
var TodoTool = require('./TodoTool');
var TodoCommand = require('./TodoCommand');
var TodoComponent = require('./TodoComponent');

module.exports = {
  name: 'todo',
  configure: function(config) {
    config.addNode(Todo);
    config.addTool(TodoTool);
    config.addCommand(TodoCommand);
    config.addComponent(Todo.static.name, TodoComponent);
  }
};