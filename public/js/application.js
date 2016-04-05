// Styles
require('./../css/style.css');

// JS > Deps
var jQuery = require('./vendor/jquery-2.0.3.js');
window.jQuery = jQuery;
window.$ = jQuery;

// JS > Our stack, namespace, lib
require('neon');
require('neon/stdlib');
window.PATOS = {
  InstallationManager: {}
};
require('./vendor/Widget.js');
require('./app.js')

// JS > Global widgets

// JS > Forms
require('./widgets/installation-manager/forms/user-edit-email-form.js');
