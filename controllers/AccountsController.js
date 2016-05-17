var path = require('path');
var Promise = require('bluebird');

var AccountsController = Class('AccountsController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_loadAccount'],
      actions: ['show', 'edit', 'update', 'destroy'] // Follows standard set by UsersController
    }
  ],

  prototype: {
    /* Tries to initially load an Account through various request parameters */
    _loadAccount: function(req, res, next) {
      var accountId, userId, branchName;
      var promise = new Promise().resolve();

      // First check for an Account ID
      if(req.params.id && Checkit.checkSync('accountId', req.params.id, ['uuid', 'required']))
        accountId = req.params.id; // This only gets set if req.params.id is a valid UUID.

      // These will get validated later
      if(req.params.userId) userId = req.params.userId;
      if(req.params.branchName) branchName = req.params.branchName;

      // If neither of the above is set, look for current logged-in User and current branch
      if(!userId && req.User) userId = req.User.id; // Defaults to current User (if applicable)
      if(!branchName && req.branch) branchName = req.branch; // Defaults to current branch

      if(accountId) {
        req.container.get('Account').getById(accountId)
        .then(function(account) {
          if(!account) throw new NotFoundError('Account ``' + accountId + '`` not found.');
          else res.locals.account = account;

          next();
        });
      } else if(userId && branchName) {
        req.container.get('Account').getByUser(userId, branchName)
        .then(function(account) {
          if(!account) throw new NotFoundError('Account related to User `' + userId + '` not found.');
          else res.locals.account = account;

          next();
        });
      }
      else {
        throw new NotFoundError('Account not found.');
        next();
      }
    },

    /* Show an Account (defaults to current logged-in Account for branch) */
    show: function(req, res, next) {
      res.format({
        html : function() {
          res.render('Accounts/show.html');
        },
        json : function() {
          res.json(res.locals.account);
        }
      });
    },

    /* TODO Edit Page */
    edit: function(req, res, next) {
      res.format({
        html : function() {
          res.render('Accounts/edit.html');
        },
        json : function() {
          res.json(res.locals.account);
        }
      });
    },

    /* Updates the Account associated with the current-logged-in User */
    update: function(req, res, next) {
      res.format({
        json : function() {
          req.container.update(res.locals.account, req.body)
            .then(function() {
              res.json(res.locals.account);
            })
            .catch(next);
        }
      });
    },

    /* Destroys the Account associated with the current-logged-in User */
    destroy: function(req, res, next) {
      res.format({
        json : function() {
          req.container.destroy(res.locals.account)
            .then(function() {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }

});

module.exports = new AccountsController();