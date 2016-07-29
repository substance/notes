'use strict';

var Cover = require('./Cover');

module.exports = {
  name: 'cover',
  configure: function(config) {
    config.addComponent('cover', Cover);
    config.addStyle(__dirname, '_cover');
    config.addStyle(__dirname, '_summary');
    config.addIcon('cover.comments', { 'fontawesome': 'fa-comment-o' });
    config.addIcon('cover.todos', { 'fontawesome': 'fa-check-square-o' });
    config.addIcon('cover.edit', { 'fontawesome': 'fa-pencil' });
  }
};