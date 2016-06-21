'use strict';

var Layout = require('substance/ui/Layout');
var Component = require('substance/ui/Component');

var Button = require('substance/ui/Button');

var Modal = require('substance/ui/Modal');
var RequestLogin = require('./RequestLogin');

function RequestEditAccess() {
  Component.apply(this, arguments);

  this.handleActions({
    'loginRequested': this._loginRequested
  });
}

RequestEditAccess.Prototype = function() {

  this._requestLogin = function() {
    console.log('authenticating now');
    this.extendState({
      requestLogin: true
    });
  };

  this.render = function($$) {
    var el = $$('div').addClass('sc-request-edit-access');

    if (this.state.loginRequested) {
      el.append(
        $$(Modal, {
          width: 'medium'
        }).append(
          $$(Layout, {textAlign: 'center'}).append(
            $$('p').append('We sent you an email with a link that gives you edit access.'),
            $$(Button).append(
              'Continue Reading'
            )
            .on('click', this.send.bind(this, 'closeModal'))
          )
        )
      );      
    } else {
      el.append(
        $$(Modal, {
          width: 'medium'
        }).append(
          $$(Layout, {textAlign: 'center'}).append(
            $$('p').append('Please enter your email below. You will receive a link that gives you edit access to the document.'),
            $$(RequestLogin, {
              documentId: this.props.documentId
            })
          )
        )
      );
    }

    return el;
  };

  this._loginRequested = function() {
    this.setState({
      loginRequested: true
    });
  };

};

Component.extend(RequestEditAccess);

module.exports = RequestEditAccess;