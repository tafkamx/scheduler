var path = require('path');
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;
var _ = require('lodash');

var UserMailer = Class('UserMailer').inherits(BaseMailer)({
  defaultOptions : {
    mandrillOptions : {
      async: false,
      auto_text : true,
      inline_css : true
    }
  },
  sendActivationLink : function sendActivationLink(adminUser) {
    var template = path.join(process.cwd(), 'views', 'mailers', 'User', 'activationLink.html');

    var templateOptions = {
      adminUser : adminUser,
      helpers : {
        urlFor : urlFor
      }
    };

    var options = {
      from : 'from@patos.net',
      to : adminUser.email,
      subject : 'PatOS: Activate your account.',
      html : this._compileTemplate(template, templateOptions)
    };

    _.assign(options, this.defaultOptions);

    return this._send(options);
  }
});

module.exports = UserMailer;
