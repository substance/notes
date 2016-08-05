'use strict';

var fs = require('fs');
var dir = '../uploads';
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}
