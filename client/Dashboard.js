var LoginStatus = require('./LoginStatus');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Dashboard() {
  Component.apply(this, arguments);
}

Dashboard.Prototype = function() {

  this.render = function() {
  	var authenticationClient = this.context.authenticationClient;
    var el = $$('div').addClass('sc-dashboard');

    var topbar = $$('div').addClass('se-header').append(
    	$$('div').addClass('se-actions').append(
	      $$('button').addClass('se-action se-new-note').on('click', this.send.bind(this, 'newNote')).append('New Note'),
	      $$('button').addClass('se-action se-example-note').on('click', this.send.bind(this, 'openNote', 'note-1')).append('Example Note')
	    ),
	    $$(LoginStatus, {
        user: authenticationClient.getUser()
      })
    );

    el.append(topbar);

    return el;
  };

};

Component.extend(Dashboard);

module.exports = Dashboard;