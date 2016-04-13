'use strict';

Class(PAT.InstallationManager, 'UserEditPasswordForm').inherits(Widget)({

  HTML: '\
    <form action="" method="POST">\
      <input type="hidden" name="_csrf" value="">\
      <input type="hidden" name="_method" value="PUT">\
      <label for="password">Password</label> <input type="password" name="password" value="">\
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
    }

  }

});
