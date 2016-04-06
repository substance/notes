var oo = require('substance/util/oo');

/*
  Holds custom info about a note. 

  This data is owned by the server, we must find a way to update it
  in realtime during an editing session
*/
function NoteInfo(props) {
  this.props = props;

  if (!props.updatedBy) {
    this.props.updatedBy = 'Anonymous';
  }
}

NoteInfo.Prototype = function() {
  
};

oo.initClass(NoteInfo);
module.exports = NoteInfo;