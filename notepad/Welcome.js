var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Welcome() {
  Component.apply(this, arguments);
}

Welcome.Prototype = function() {
  this.render = function() {
    var el = $$('div').addClass('se-intro').append(
      $$('div').addClass('se-intro-text').html('Substance Notepad is a <strong>real-time collaborative</strong> notes editor.')
    );
    return el;
  };
};

Component.extend(Welcome);

module.exports = Welcome;


