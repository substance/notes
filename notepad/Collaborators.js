var Component = require('substance/ui/Component');
var forEach = require('lodash/forEach');
var $$ = Component.$$;

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

  this._extractInitials = function(name) {
    var parts = name.split(' ');
    return parts.map(function(part) {
      return part[0].toUpperCase(); // only use the first letter of a part
    });
  };

  this.render = function() {
    var el = $$('div').addClass('se-collaborators');

    var collaborators = this.props.session.collaborators;
    forEach(collaborators, function(collaborator) {
      var initials = this._extractInitials(collaborator.user.name);
      el.append(
        $$('div').addClass('se-collaborator sm-collaborator-'+collaborator.colorIndex).attr({title: collaborator.user.name}).append(
          initials
        )
      );
    }.bind(this));
    return el;
  };
};

Component.extend(Collaborators);

module.exports = Collaborators;