var bcrypt = require('bcrypt-node');
var path = require('path');

var User = Class('User').inherits(DynamicModel)({
  tableName : 'Users',

  validations : {
    email : [
      'email',
      {
        rule : function(val) {
          var query = User.query(this.target._knex)
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

      this.on('beforeSave', function (next) {
        if (!model.mailers) {
          return next(new Error('.mailers is required before saving'));
        }

        return next();
      });

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
        var info = new UserInfo({
          userId: model.id,
          role: model.role
        });

        info
          .save(model._knex)
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Send activation email after creation
      this.on('afterCreate', function(next) {
        model.mailers.user.sendActivationLink(model)
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

        model.mailers.user.sendChangedPasswordNotification(model)
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

        model.mailers.user.sendChangedEmailEmails(model)
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

module.exports = User;
