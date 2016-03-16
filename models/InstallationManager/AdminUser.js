var bcrypt = require('bcrypt-node');
var path = require('path');

var AdminUserMailer = require(path.join(process.cwd(), 'mailers', 'AdminUserMailer'));

InstallationManager.AdminUser = Class(InstallationManager, 'AdminUser').inherits(InstallationManager.InstallationManagerModel)({
  tableName : 'Users',
  validations : {
    'email' : [
      'email',
      {
        rule : function(val) {
          var query = InstallationManager.AdminUser.query()
            .where({
              email : val
            });

          if (this.target.id) {
            query.andWhere('id', '<>', this.target.id);
          }
          return query.then(function(result) {
            if (result.length > 0) {
              throw new Error('The email already exists.');
            }
          })
        },
        message : 'The email already exists'
      },
      'required',
      'maxLength:255'
    ],
    'password' : [
      'minLength:8'
    ]
  },
  attributes : ['id', 'email', 'encryptedPassword', 'token', 'createdAt', 'updatedAt'],
  relations : {},

  prototype : {
    email : null,
    encryptedPassword : null,
    token : null,
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

      this.on('afterCreate', function(next) {
        AdminUserMailer.sendActivationLink(model).then(function() {
          next();
        }).catch(function(err) {
          throw new Error(err);
        });
      });
    },

    activate : function() {
      this.token = null;

      return this;
    },
  }
});

module.exports = InstallationManager.AdminUser;
