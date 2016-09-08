'use strict';

var Todo = require('./Todo');
var TodoTool = require('./TodoTool');
var TodoCommand = require('./TodoCommand');
var TodoComponent = require('./TodoComponent');

module.exports = {
  name: 'todo',
  configure: function(config) {
    config.addNode(Todo);
    config.addTool(Todo.type, TodoTool);
    config.addCommand(Todo.type, TodoCommand, { nodeType: Todo.type });
    config.addComponent(Todo.type, TodoComponent);
    config.addIcon(Todo.type, {'fontawesome': 'fa-check-square-o'});
    config.addStyle(__dirname, '_todo');
  }
};