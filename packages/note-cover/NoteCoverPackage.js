'use strict';

module.exports = {
  name: 'note-cover',
  configure: function(config) {
    config.addIcon('cover.comments', { 'fontawesome': 'fa-comment-o' });
    config.addIcon('cover.todos', { 'fontawesome': 'fa-check-square-o' });
    config.addIcon('cover.edit', { 'fontawesome': 'fa-pencil' });
  }
};