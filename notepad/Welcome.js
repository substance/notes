var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Welcome() {
  Component.apply(this, arguments);
}

Welcome.Prototype = function() {
  this.render = function() {
    var el = $$('sc-notes-welcome');
    
    el.html(this.i18n.t('sc-notes-welcome.intro', {}));

    return el;
  };
};

Component.extend(Welcome);

module.exports = Welcome;


