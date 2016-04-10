var Component = require('substance/ui/Component');
var $$ = Component.$$;
var Controller = require('substance/ui/Controller');
var ContainerEditor = require('substance/ui/ContainerEditor');
var Cover = require('./Cover');

/* Works well on mobile */
function NoteReader() {
  Controller.apply(this, arguments);
}

NoteReader.Prototype = function() {

  // Custom Render method for your editor
  this.render = function() {
    var config = this.getConfig();
    return $$('div').addClass('sc-notepad').append(   
      $$('div').addClass('se-note-content').append(
        $$(Cover, {
          mobile: this.props.mobile,
          editing: 'readonly',
          noteInfo: this.props.noteInfo
        }).ref('cover'),
        $$(ContainerEditor, {
          doc: this.props.documentSession.doc,
          containerId: 'body',
          name: 'bodyEditor',
          editing: 'readonly',
          commands: config.bodyEditor.commands,
          textTypes: config.bodyEditor.textTypes
        }).ref('bodyEditor')
      )
    );
  };
};

Controller.extend(NoteReader);

NoteReader.static.config = {
  i18n: {
    'todo.content': 'Todo'
  },
  // Controller specific configuration (required!)
  controller: {
    // Component registry
    components: {
      'paragraph': require('substance/packages/paragraph/ParagraphComponent'),
      'heading': require('substance/packages/heading/HeadingComponent'),
      'comment': require('./CommentComponent'),
      'image': require('substance/packages/image/ImageComponent'),
      'link': require('substance/packages/link/LinkComponent'),
      'todo': require('./TodoComponent'),
      'codeblock': require('substance/packages/codeblock/CodeblockComponent'),
      'blockquote': require('substance/packages/blockquote/BlockquoteComponent')
    },
    // Controller commands
    commands: [
      require('substance/ui/UndoCommand'),
      require('substance/ui/RedoCommand'),
      require('substance/ui/SaveCommand')
    ]
  },
  titleEditor: {
    commands: [
      require('substance/packages/emphasis/EmphasisCommand'),
      require('substance/packages/text/SwitchTextTypeCommand'),
      require('substance/packages/subscript/SubscriptCommand'),
      require('substance/packages/superscript/SuperscriptCommand')
    ]
  },
  // Custom configuration (required!)
  bodyEditor: {
    commands: [
      require('substance/packages/text/SwitchTextTypeCommand'),
      require('substance/packages/strong/StrongCommand'),
      require('substance/packages/emphasis/EmphasisCommand'),
      require('substance/packages/link/LinkCommand'),
      require('substance/packages/image/ImageCommand'),
      require('./MarkCommand'),
      require('./TodoCommand'),
      require('./CommentCommand')
    ],
    textTypes: [
      {name: 'paragraph', data: {type: 'paragraph'}},
      {name: 'heading1',  data: {type: 'heading', level: 1}},
      {name: 'heading2',  data: {type: 'heading', level: 2}},
      {name: 'heading3',  data: {type: 'heading', level: 3}},
      {name: 'codeblock', data: {type: 'codeblock'}},
      {name: 'blockquote', data: {type: 'blockquote'}}
    ]
  }
};

module.exports = NoteReader;
