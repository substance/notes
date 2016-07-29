'use strict';

var Layout = require('substance/ui/Layout');
var Button = require('substance/ui/Button');
var Loader = require('../common/Loader');
var Reader = require('./Reader');

function ReadNote() {
  Loader.apply(this, arguments);

  this.handleActions({
    'closeModal': this._closeModal
  });
}

ReadNote.Prototype = function() {

  this._requestLogin = function() {
    this.extendState({
      requestLogin: true
    });
  };

  this.render = function($$) {
    var componentRegistry = this.context.componentRegistry;
    var RequestEditAccess = componentRegistry.get('request-edit');

    var userSession = this.props.userSession;
    var el = $$('div').addClass('sc-read-note');

    var layout = $$(Layout, {
      width: 'large'
    });

    // Display top-level errors. E.g. when a doc could not be loaded
    // we will display the notification on top level
    if (this.state.error) {
      layout.append($$(Notification, {
        type: 'error',
        message: this.state.error.message
      }));
    } else if (this.state.session) {
      if (!userSession && !this.props.mobile) {
        layout.append(
          $$(Layout, {
            textAlign: 'center',
            noPadding: true
          }).append(
            $$(Button).addClass('se-new-note-button').append(
              this.context.iconProvider.renderIcon($$, 'edit-note'),
              ' Edit'
            ).on('click', this._requestLogin)
          )
        );
      }

      layout.append(
        $$(Reader, {
          configurator: this.props.configurator,
          mobile: this.props.mobile,
          noteInfo: this.state.noteInfo,
          documentSession: this.state.session
        }).ref('noteReader')
      );
    }

    if (this.state.requestLogin) {
      el.append($$(RequestEditAccess, {
        documentId: this.getDocumentId()
      }));
    }

    el.append(layout);
    return el;
  };

  this._closeModal = function() {
    this.extendState({
      requestLogin: undefined
    });
  };
};

Loader.extend(ReadNote);

module.exports = ReadNote;