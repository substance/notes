'use strict';

var SubConfigurator = require('../common/SubConfigurator');
var Note = require('../note/package');
var Dashboard = require('../dashboard/package');


var HeaderPackage = require('../header/package');
//var LoaderPackage = require('../loader/package');
var NotificationPackage = require('../notification/package');
var CollaboratorsPackage = require('../collaborators/package');
var WelcomePackage = require('../welcome/package');


var ReaderPackage = require('../reader/package');
var WriterPackage = require('../writer/package');
var NotePage = require('./NotePage');

var ReaderConfigurator = new SubConfigurator().import(ReaderPackage);
var WriterConfigurator = new SubConfigurator().import(WriterPackage);

module.exports = {
  name: 'notes',
  configure: function(config) {
    config.addComponent('note', NotePage);

    config.import(require('substance/packages/base/BasePackage'));
    config.import(Note);
    config.import(Dashboard);
    config.import(HeaderPackage);
    //config.import(LoaderPackage);
    config.import(NotificationPackage);
    config.import(CollaboratorsPackage);
    config.import(WelcomePackage);

    config.addIcon('edit-note', { 'fontawesome': 'fa-pencil' });

    // Default configuration for available modes
    config.addConfigurator('reader', ReaderConfigurator);
    config.addConfigurator('writer', WriterConfigurator);
  }
};