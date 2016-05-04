var bcrypt = require('bcrypt-node');
var path = require('path');
var UserMailer = require(path.join(process.cwd(), 'mailers', 'UserMailer'));

Class(M, 'User').inherits(DynamicModel)({
  tableName : 'Users',

  validations : {
    email : [
      'email',
      {
        rule : function(val) {
          var that = this.target;

          var query = that._container.query('User')
            .where({
              email : val
            });

          if (this.target.id) {
            query.andWhere('id', '!=', that.id);
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

    password : ['minLength:8']
  },

  attributes : ['id', 'email', 'encryptedPassword', 'token', 'createdAt', 'updatedAt'],

  prototype : {
    password: null,
    role: null,
    _oldEmail: null,
    _skipPasswordEmail: false,

    init : function(config) {
      DynamicModel.prototype.init.call(this, config);

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

      // UserInfo instance
      this.on('afterCreate', function (next) {
        model._container
          .create('UserInfo', {
            userId: model.id,
            role: model.role
          })
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Send activation email after creation
      this.on('afterCreate', function(next) {
        UserMailer.sendActivationLink(model)
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Handler for when password was updated
      this.on('afterUpdate', function (next) {
        if (model._skipPasswordEmail || !model.password) {
          return next();
        }

        // in order to prevent the password changed notice several times
        model._skipPasswordEmail = true;

        UserMailer.sendChangedPasswordNotification(model)
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Send changed email update when the email changes
      this.on('afterUpdate', function (next) {
        if (model._oldEmail === model.email) {
          return next();
        }

        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);

        UserMailer.sendChangedEmailEmails(model)
          .then(function () {
            next();
          })
          .catch(next);
      });

      this.on('afterSave', function (next) {
        model._oldEmail = model.email;
        next();
      });
    },

    activate : function() {
      this.token = null;

      return this;
    },
  }
});

module.exports = M.User;
