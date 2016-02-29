var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Dashboard() {
  Component.apply(this, arguments);
}

Dashboard.Prototype = function() {

  this.render = function() {
    var el = $$('div').addClass('sc-dashboard').append(
      $$('button').addClass('se-new-note').on('click', this.send.bind(this, 'newNote')).append('New Note'),
      $$('button').addClass('se-example-note').on('click', this.send.bind(this, 'openNote', 'note-1'))
    );
    return el;
  };

};

Component.extend(Dashboard);

module.exports = Dashboard;