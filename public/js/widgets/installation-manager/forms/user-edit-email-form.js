'use strict';

PATOS.InstallationManager.UserEditEmailForm = Class(PATOS.InstallationManager, 'UserEditEmailForm').includes(Widget)({

  HTML: '<form action="/">a form is here</form>',

  prototype: {

    user: null,

  }

});

module.exports = PATOS.InstallationManager.UserEditEmailForm;
