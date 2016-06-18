'use strict';

var Todo = require('./Todo');
var TodoTool = require('./TodoTool');
var TodoCommmand = require('./TodoCommmand');
var TodoComponent = require('./TodoComponent');

module.exports = {
  name: 'todo',
  configure: function(config) {
    config.addNode(Todo);
    config.addTool(TodoTool);
    config.addCommand(TodoCommmand);
    config.addComponent(Todo.static.name, TodoComponent);
  }
};