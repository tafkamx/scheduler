var path = require('path');
var Promise = require('bluebird');
var Checkit = require('checkit');

var AccountsController = Class('AccountsController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_loadAccount'],
      actions: ['index', 'show', 'edit', 'update', 'destroy'] // Follows standard set by UsersController
    }
  ],

  prototype: {
    /* Tries to initially load an Account through various request parameters */
    _loadAccount: function(req, res, next) {
      var accountId, userId, branchName;

      // First check for an Account ID
      if(req.params.id) {
        var checkit = Checkit.checkSync('accountId', req.params.id, ['uuid', 'required']);
        if(checkit[0] == null) accountId = req.params.id;
      }

      // These will get validated later
      if(req.params.userId) userId = req.params.userId;
      if(req.params.branchName) branchName = req.params.branchName;

      // If neither of the above is set, look for current logged-in User and current branch
      if(!userId && req.User) userId = req.User.id; // Defaults to current User (if applicable)
      if(!branchName && req.branch) branchName = req.branch; // Defaults to current branch

      if(accountId) {
        req.container.get('Account').getById(accountId)
        .then(function(account) {
          if(!account) throw new NotFoundError('Account `' + accountId + '` not found.');
          res.locals.account = account;

          next();
        }).catch(next);
      } else if(userId && branchName) {
        req.container.get('Account').getByUser(userId, branchName)
        .then(function(account) {
          if(!account) throw new NotFoundError('Account related to User `' + userId + '` not found.');
          res.locals.account = account;

          next();
        }).catch(next);
      }
      else next();
    },

    index: function(req, res, next) {
      req.container.get('Account').query()
      .then(function(results) {
        res.locals.accounts = results;

        res.format({
          html : function() {
            res.render('Accounts/index.html');
          },
          json : function() {
            res.json(results);
          }
        });
      }).catch(next);
    },

    new: function(req, res, next) {
      return res.format({
        html: function () {
          res.render('Accounts/new.html');
        }
      });
    },

    create: function(req, res, next) {
      res.format({
        json: function () {
          req.container.create('Account', req.body)
            .then(function (account) {
              res.json(account);
            })
            .catch(next);
        }
      });
    },

    /* Show an Account (defaults to current logged-in Account for branch) */
    show: function(req, res, next) {
      if(!res.locals.account) throw new NotFoundError('You must specify an Account or be logged in.');
      else {
        res.format({
          html : function() {
            res.render('Accounts/show.html');
          },
          json : function() {
            res.json(res.locals.account);
          }
        });
      }
    },

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

    /* Destroys the Account associated with the current request */
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
