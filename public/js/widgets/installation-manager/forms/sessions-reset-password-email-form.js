'use strict';

Class(PAT.InstallationManager, 'SessionsResetPasswordEmailForm').inherits(Widget)({

  HTML: '<p>Please enter your email:</p>\
    <form action="" method="POST">\
      <input type="hidden" name="_csrf" value="">\
      <input type="text" name="email" value="">\
      <input type="submit" value="Submit">\
    </form>',

  prototype: {

    /**
     * {
     *   url,
     *   csrfToken
     * }
     */
    data: null,

    init: function (config) {
      Widget.prototype.init.call(this, config);

      var that = this;

      that.element.attr('action', that.data.url);
      that.element.children('input[name=_csrf]').attr('value', that.data.csrfToken);
      that.element.children('input[name=_token]').attr('value', that.data.token);
    }

  }

});
