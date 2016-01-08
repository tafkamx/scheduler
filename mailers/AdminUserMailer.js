var path = require('path');
var _  = require('lodash');

var AdminUserMailer = Class('AdminUserMailer').inherits(BaseMailer)({
  defaultOptions : {
    mandrillOptions : {
      async: false,
      auto_text : true,
      inline_css : true
    }
  },
  sendActivationLink : function sendActivationLink(adminUser) {
    var template = path.join(process.cwd(), 'views', 'mailers', 'AdminUser', 'activationLink.html');

    var options = {
      from : 'from@patos.net',
      to : adminUser.email,
      subject : 'PatOS: Activate your account.',
      html : this._compileTemplate(template, {adminUser : adminUser})
    };

    _.assign(options, this.defaultOptions);

    return this._send(options);
  }
});

module.exports = AdminUserMailer;
