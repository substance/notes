var Component = require('substance/ui/Component');
var $$ = Component.$$;
var moment = require('moment');

function NoteItem() {
  Component.apply(this, arguments);
}

NoteItem.Prototype = function() {

  this.render = function() {
    var el = $$('div').addClass('sc-note-item');

    // Title
    el.append(
      $$('div').addClass('se-title')
        .append(
          $$('a')
            .attr({href: '#mode=edit,docId='+this.props.documentId})
            .append(this.props.title)
        )
    );

    // TODO: Add HTML preview here
    el.append(
      $$('div').addClass('se-preview').append(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin mattis tincidunt massa, ac lacinia mauris facilisis ut. Cras vitae neque leo. Donec convallis erat rutrum dui sagittis, id bibendum urna tincidunt. Donec sed augue non erat maximus suscipit eu ut turpis. Nam placerat dui nec dictum consequat. Nam eu enim porta, aliquet elit quis, condimentum ipsum. Donec dignissim ac lectus vitae porttitor.....'
      )
    );

    // Creator + collaborators |  updatedAt
    var authors = [];
    authors.push($$('strong').append(this.props.creator || 'Anonymous'));
    if (this.props.collaborators.length > 0) {
      authors.push(' with ');
      authors.push(this.props.collaborators.join(', '));      
    }

    var updatedAt = [
      'Updated ',
      moment(this.props.updatedAt).fromNow(),
      'by',
      this.props.updatedBy || 'Anonymous'
    ];

    el.append(
      $$('div').addClass('se-meta').append(
        $$('span').addClass('se-meta-item se-authors').append(authors),
        $$('span').addClass('se-meta-item se-updated-at').append(updatedAt.join(' ')),
        $$('button').addClass('se-meta-item se-delete').append('Delete')
          .on('click', this.send.bind(this, 'deleteNote', this.props.documentId))
      )
    );
    return el;
  };
};

Component.extend(NoteItem);

module.exports = NoteItem;
