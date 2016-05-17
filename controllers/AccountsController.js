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
    /**
     * Tries to initially load an Account through various request parameters
     */
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

      // Set `res.locals.account` for the methods below, or throw `NotFoundError`.
    },

    /**
     * HTTP Action to show an Account (defaults to current logged-in Account for branch)
     */
    show: function(req, res, next) {

    },

    edit: function(req, res, next) {

    },

    update: function(req, res, next) {

    },

    destroy: function(req, res, next) {

    }
  }

});

module.exports = new AccountsController();
