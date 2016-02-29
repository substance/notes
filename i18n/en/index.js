// It is not possible to do require('fs').readFileSync from within a function
// it all needs to be done statically.
// 
// function getFile(name) {
//   var str = require('fs').readFileSync(__dirname + '/' + name, 'utf8');
//   return str;
// }

var fs = require('fs');

module.exports = {
  /*
    Welcome page
  */
  // 'sc-notes-welcome.intro': getFile('sc-welcome.intro.html'),
  'sc-welcome.intro': fs.readFileSync(__dirname + '/sc-welcome.intro.html', 'utf8')
};