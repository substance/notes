'use strict';

var Component = require('substance/ui/Component');

var EnterName = require('./EnterName');
var EditNote = require('./EditNote');
var ReadNote = require('./ReadNote');

function NoteSection() {
  Component.apply(this, arguments);
}

NoteSection.Prototype = function() {

  this.render = function($$) {
    var userSession = this.props.userSession;
    var el = $$('div').addClass('sc-note-section');

    if (userSession && !this.props.mobile) {
      var userName = userSession.user.name;

      if (userName) {
        el.append($$(EditNote, {
          configurator: this.props.configurator,
          documentId: this.props.route.documentId,
          userSession: userSession,
          mobile: this.props.mobile
        }).ref('editNote'));        
      } else {
        el.append($$(EnterName, {
          userSession: userSession
        }));
      }
    } else {
      el.append($$(ReadNote, {
        configurator: this.props.configurator,
        documentId: this.props.route.documentId,
        userSession: userSession,
        mobile: this.props.mobile
      }).ref('readNote'));
    }

    return el;
  };

};

Component.extend(NoteSection);

module.exports = NoteSection;