var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var Promise = require('bluebird');

var BaseMailer = Class('BaseMailer')({
  _transport : null,

  transport : function transport(transport) {
    if (transport) {
      this._transport = transport;
      return transport;
    } else {
      var klass = this;

      while (klass && !klass._transport) {
        var proto = klass.prototype.__proto__;
        klass = proto && proto.constructor;
      }

      if (klass && klass._transport) {
        return klass && klass._transport;
      } else  {
        throw new Error('Mailer doesn\'t have a nodemailer transport instance');
      }
    }
  },

  _compileTemplate : function _compileTemplate(templatePath, params) {
    var template = new Thulium({
      template : fs.readFileSync(templatePath, 'utf8')
    });

    template.parseSync().renderSync(params);

    return template.view;
  },

  _send : function _send(options) {
    if (!CONFIG[CONFIG.environment].mailer.sendEmails) {
      return Promise.resolve(true);
    }

    // return promise
    logger.info('Sending an email...');
    logger.info(options);
    return this.transport().sendMail(options);
  }
});

module.exports = BaseMailer;
