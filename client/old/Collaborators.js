'use strict';

var Component = require('substance/ui/Component');
var forEach = require('lodash/forEach');

function Collaborators() {
  Component.apply(this, arguments);
}

Collaborators.Prototype = function() {

  this.didMount = function() {
    this._init();
  };

  this.willReceiveProps = function() {
    this.dispose();
    this._init();
  };

  this._init = function() {
    this.props.session.on('collaborators:changed', this.rerender, this);
  };

  this.dispose = function() {
    this.props.session.off(this);
  };

  this.render = function($$) {
    var el = $$('div').addClass('sc-collaborators');

    var collaborators = this.props.session.collaborators;
    forEach(collaborators, function(collaborator) {
      var initials = this._extractInitials(collaborator);
      el.append(
        $$('div').addClass('se-collaborator sm-collaborator-'+collaborator.colorIndex).attr({title: collaborator.name || 'Anonymous'}).append(
          initials
        )
      );
    }.bind(this));
    return el;
  };

  this._extractInitials = function(collaborator) {
    var name = collaborator.name;
    if (!name) {
      return 'A';
    }
    var parts = name.split(' ');
    return parts.map(function(part) {
      return part[0].toUpperCase(); // only use the first letter of a part
    });
  };
};

Component.extend(Collaborators);

module.exports = Collaborators;