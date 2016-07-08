var bcrypt = require('bcrypt-node');
var path = require('path');
var Promise = require('bluebird');

var userMailer = new InstallationManager.UserMailer({});

Class(InstallationManager, 'User').inherits(InstallationManager.InstallationManagerModel)({
  tableName: 'Users',

  validations: {
    email : [
      'email',
      {
        rule : function(val) {
          var query = InstallationManager.User.query()
            .where({
              email : val
            });

          if (this.target.id) {
            query.andWhere('id', '!=', this.target.id);
          }

          return query.then(function(result) {
            if (result.length > 0) {
              throw new Error('The email already exists.');
            }
          })
        },
        message : 'The email already exists.'
      },
      'required',
      'maxLength:255'
    ],

    password : [
      'minLength:8'
    ]
  },

  attributes : ['id', 'email', 'encryptedPassword', 'token', 'createdAt', 'updatedAt'],

  prototype : {
    password: null,
    role: 'admin',
    _oldEmail: null,
    _skipPasswordEmail: false,

    init : function(config) {
      InstallationManager.InstallationManagerModel.prototype.init.call(this, config);

      var model = this;
      model._oldEmail = model.email;

      // Encrypt 'password' and assign to model as encryptedPassword
      this.on('beforeSave', function(next) {
        if (model.password) {
          model.encryptedPassword = bcrypt.hashSync(model.password, bcrypt.genSaltSync(10), null);
        }

        next();
      });

      // Add token for confirmation
      this.on('beforeCreate', function(next) {
        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);

        next();
      });

      // Set new token if email changes
      this.on('afterUpdate', function (next) {
        if (model._oldEmail === model.email) {
          return next();
        }

        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);

        next();
      });

      this.on('afterSave', function (next) {
        model._oldEmail = model.email;
        next();
      });

      // Mailers

      // Send activation email after creation
      this.on('afterCreate', function(next) {
        userMailer.sendActivationLink(model)
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Send changed email email when the email changes
      this.on('afterUpdate', function (next) {
        if (model._oldEmail === model.email) {
          return next();
        }

        userMailer.sendChangedEmailEmails(model)
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Send changed password email
      this.on('afterUpdate', function (next) {
        if (model._skipPasswordEmail || !model.password) {
          return next();
        }

        // in order to prevent the password changed notice several times
        model._skipPasswordEmail = true;

        userMailer.sendChangedPasswordNotification(model)
          .then(function () {
            next();
          })
          .catch(next);
      });
    },

    activate : function() {
      this.token = null;

      return this;
    },

    getHostname : function() {
      return Promise.resove().then(() => {
        return CONFIG.env().defaultDomainName;
      });
    }
  }
});

module.exports = InstallationManager.User;
