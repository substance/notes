'use strict';

var Component = require('substance/ui/Component');

function NotePage() {
  Component.apply(this, arguments);
}

NotePage.Prototype = function() {

  this.getChildConfigurator = function(mode) {
    var notesConfigurator = this.context.configurator;
    return notesConfigurator.getConfigurator(mode);
  };

  this.render = function($$) {
    var componentRegistry = this.context.componentRegistry;
    var EnterName = componentRegistry.get('enter-name');

    var userSession = this.props.userSession;
    var el = $$('div').addClass('sc-note-section');

    var mode;

    if(userSession && !this.props.mobile) {
      mode = 'writer';
      // If user logged in, but didn't have name
      // show enter name dialog
      var userName = userSession.user.name;
      if(!userName) {
        el.append($$(EnterName, {
          userSession: userSession
        }));
        return el;
      }
    } else {
      mode = 'reader';
    }

    var configurator = this.getChildConfigurator(mode);
    var childComponentRegistry = configurator.getComponentRegistry();
    var EditorComponent = childComponentRegistry.get(mode);
    
    el.append($$(EditorComponent, {
      configurator: configurator,
      documentId: this.props.documentId,
      userSession: userSession,
      mobile: this.props.mobile
    }).ref('editor'));

    return el;
  };

};

Component.extend(NotePage);

module.exports = NotePage;