var Component = require('substance/ui/Component');
var $$ = Component.$$;

function StatusBar() {
  Component.apply(this, arguments);
}

StatusBar.Prototype = function() {

  this.render = function() {
    var status = this.props.status;
    var type = status.type;
    var message = status.message;

    var el = $$('div').addClass('sc-status-bar se-type-' + type);
    el.append(message);
    return el;
  };
};

Component.extend(StatusBar);

module.exports = StatusBar;