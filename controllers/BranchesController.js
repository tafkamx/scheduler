var path = require('path');
var bcrypt = require('bcrypt-node');

var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

var aclBeforeActionsGenerator = require(path.join(process.cwd(), 'lib', 'utils', 'acl-before-actions-generator.js'));

// Requiring here because otherwise neonode.controllers['InstallationManager.Installations']
// is not defined and thus the beforeActions crash
neonode.controllers['InstallationManager.Installations'] = require('./InstallationManager/InstallationsController.js');

var BranchesController = Class('BranchesController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_loadBranch'],
      actions: ['show', 'edit', 'update', 'destroy']
    },
    {
      before : function(req, res, next) {
        RESTFulAPI.createMiddleware({
          queryBuilder : req.container.query('Branch').include('settings'),
          filters : {
            allowedFields : ['name']
          }
        })(req, res, next);
      },
      actions : ['index']
    },
    {
      before : [neonode.controllers['InstallationManager.Installations']._loadTimezones],
      actions : ['new', 'edit']
    },
  ],
  /*
  .concat(aclBeforeActionsGenerator([
    'index',
    'show',
    'new',
    'create',
    'edit',
    'update',
    'destroy'
  ], 'branches')),
  */

  prototype: {
    _loadBranch: function(req, res, next) {
      req.container.query('Branch')
        .where({ id: req.params.id })
        .include('settings')
        .then(function (result) {
          if (result.length === 0) {
            throw new NotFoundError('Branch ' + req.params.id + ' not found');
          }

          res.locals.branch = result[0];

          next();
        })
        .catch(next);
    },

    index: function (req, res, next) {

      res.format({
        html: function () {
          res.render('Branches/index.html', { branches : res.locals.results });
        },
        json: function () {
          res.json(res.locals.results);
        }
      });
    },

    show: function (req, res, next) {
      res.format({
        html: function () {
          res.render('Branches/show.html');
        },
        json: function () {
          res.json(res.locals.branch);
        }
      });
    },

    new: function (req, res, next) {
      return res.format({
        html: function () {
          res.render('Branches/new.html');
        }
      });
    },

    create: function (req, res, next) {
      res.format({
        json: function () {
          var user = req.body.franchiseeUser;
          var account = req.body.franchiseeAccount || {};

          delete req.body.franchiseeUser;
          delete req.body.franchiseeAccount;

          var branch;

          req.container.create('Branch', req.body)
            .then(function (res) {
              branch = res;

              user.password = bcrypt.hashSync(CONFIG[CONFIG.environment].sessions.secret + Date.now(), bcrypt.genSaltSync(12), null).slice(0, 11);

              account.branchName = branch.name;
              account.type = 'franchisee';

              return req.container.get('User').createWithAccount(user, account);
            })
            .then(function (user) {
              branch._franchiseeUser = user.user;
              branch._franchiseeAccount = user.account;

              res.json(branch);
            })
            .catch(next);
        }
      });
    },

    edit: function (req, res, next) {
      res.format({
        html: function () {
          res.render('Branches/edit.html');
        },
        json: function () {
          res.json(res.locals.branch);
        }
      });
    },

    update: function (req, res, next) {
      res.format({
        json: function () {
          req.container.update(res.locals.branch, req.body)
            .then(function () {
              if (!req.body.settings) {
                return;
              }

              return Promise.resolve()
                .then(function () {
                  return req.container.query('BranchSettings')
                    .where('branch_id', res.locals.branch.id);
                })
                .then(function (settings) {
                  res.locals.branch.settings = settings[0];

                  return req.container.update(res.locals.branch.settings, req.body.settings);
                });
            })
            .then(function (val) {
              res.json(res.locals.branch);
            })
            .catch(next);
        }
      });
    },

    destroy: function (req, res, next) {
      res.format({
        json: function () {
          req.container.destroy(res.locals.branch)
            .then(function () {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }
});

module.exports = new BranchesController();
