'use strict';

Class(PAT.InstallationManager, 'SessionsResetPasswordPasswordForm').inherits(Widget)({

  HTML: '<p>Please enter your new password:</p>\
    <form action="" method="POST">\
      <input type="hidden" name="_csrf" value="">\
      <input type="hidden" name="_method" value="PUT">\
      <input type="hidden" name="token" value="">\
      <input type="password" name="password" value="">\
      <input type="submit" value="Submit">\
    </form>',

  prototype: {

    /**
     * {
     *   url,
     *   csrfToken,
     *   token
     * }
     */
    data: null,

    init: function (config) {
      Widget.prototype.init.call(this, config);

      var that = this;

      that.element.attr('action', that.data.url);
      that.element.children('input[name=_csrf]').attr('value', that.data.csrfToken);
      that.element.children('input[name=token]').attr('value', that.data.token);
    }

  }

});
