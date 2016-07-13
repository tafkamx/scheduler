var bcrypt = require('bcrypt-node');
var path = require('path');
var Promise = require('bluebird');

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

  // This function needs to be called from a container.get() model
  // account can optionally be an empty object
  createWithAccount: function (user, account) {
    var result = {};

    var that = this;

    return this._container.create('User', user)
      .then(function (res) {
        account.userId = res.id;

        result.user = res;

        if (Object.keys(account).length === 0) {
          return null;
        }

        return that._container.create('Account', account);
      })
      .then(function (res) {
        result.account = res;

        return result;
      });
  },

  prototype : {
    password: null,
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
        model._modelExtras.mailers.user.sendActivationLink(model)
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

        model._modelExtras.mailers.user.sendChangedEmailEmails(model)
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

        model._modelExtras.mailers.user.sendChangedPasswordNotification(model)
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

    getRole : function() {
      var user = this;
      var container = this._container;

      var role = false;

      return container.query('InstallationSettings')
        .where('franchisor_id', user.id )
        .then(settings => {
          if (settings.length !== 0) {
            role = 'Franchisor';
            return true;
          }

          return false
        })
        .then(isFranchisor => {
          if (isFranchisor) {
            return false;
          }

          return container.query('Account')
            .where('user_id', user.id)
            .then(accounts => {
              if (accounts.length === 0) {
                return role;
              }

              role = accounts[0].type;

              return true;
            });
        })
        .then(() => {
          return role;
        });
    },

    getBranch : function() {
      var user = this;
      var container = this._container;

      var branch = false;

      return this.getRole().then(role => {
        if (!role) { // means Franchisor
          return false;
        }

        return container.query('Account')
          .include('branch')
          .where('user_id', user.id)
          .then(accounts => {
            if (accounts.length === 0) {
              return false;
            }

            var account = accounts[0];

            if (!account.branch) {
              return false;
            }

            return account.branch;
          });
      })
      .then(branch => {
        return branch.name;
      });
    },

    getHostname : function() {
      var user = this;
      var container = this._container;

      var branch,
        customDomain,
        installationName,
        hostname;

      return this.getBranch(branch => {
        branch = branch;
        return Promise.resolve();
      })
      .then(() => {
        return InstallationManager.Installation.query()
          .where('name', container.props.installationName)
          .then(installation => {

            if (installation.length === 0) {
              return Promise.resolve(false);
            }

            installationName = installation[0].name;
            customDomain = installation[0].domain || null;

            return Promise.resolve(true);
          });
      })
      .then((hasInstallation) => {
        if (!hasInstallation) {
          return '';
        }

        if (customDomain) {
          hostname =  branch ? [branch, customDomain].join('.') : customDomain;
        } else {
          hostname =  branch ? [branch, installationName, CONFIG.env().defaultDomainName].join('.') : [installationName, CONFIG.env().defaultDomainName].join('.');
        }

        return hostname;
      });
    }
  }
});

module.exports = M.User;
