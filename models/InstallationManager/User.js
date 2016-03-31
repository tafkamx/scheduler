var bcrypt = require('bcrypt-node');
var path = require('path');

var UserMailer = require(path.join(process.cwd(), 'mailers', 'UserMailer'));

InstallationManager.User = Class(InstallationManager, 'User').inherits(InstallationManager.InstallationManagerModel)({
  tableName : 'Users',
  validations : {
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
    email : null,
    encryptedPassword : null,
    token : null,
    role: 'admin',

    init : function(config) {
      InstallationManager.InstallationManagerModel.prototype.init.call(this, config);

      var model = this;

      this.on('beforeCreate', function(next) {
        model.token = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null);
        next();
      });

      this.on('beforeSave', function(next) {
        if (model.password) {
          model.encryptedPassword = bcrypt.hashSync(model.password, bcrypt.genSaltSync(10), null);
        }
        next();
      });

      // UserInfo instance
      this.on('afterCreate', function (next) {
        var info = new InstallationManager.UserInfo({
          userId: model.id,
          role: model.role
        });

        info
          .save()
          .then(function () {
            next();
          })
          .catch(next);
      });

      this.on('afterCreate', function(next) {
        UserMailer.sendActivationLink(model).then(function() {
          next();
        }).catch(function(err) {
          throw err;
        });
      });
    },

    activate : function() {
      this.token = null;

      return this;
    },
  }
});

module.exports = InstallationManager.User;
