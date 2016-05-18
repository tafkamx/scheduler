var path = require('path');
var urlFor = CONFIG.router.helpers;
var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

var aclBeforeActionsGenerator = require(path.join(process.cwd(), 'lib', 'utils', 'acl-before-actions-generator.js'));

var BranchesController = Class('BranchesController').inherits(BaseController)({

  beforeActions: [
    {
      before: ['_loadBranch'],
      actions: ['show', 'edit', 'update', 'destroy']
    },
    {
      before : function(req, res, next) {
        RESTFulAPI.createMiddleware({
          queryBuilder : req.container.query('Branch'),
          filters : {
            allowedFields : ['name']
          }
        })(req, res, next);
      },
      actions : ['index']
    }
  ].concat(aclBeforeActionsGenerator([
    'index',
    'show',
    'new',
    'create',
    'edit',
    'update',
    'destroy'
  ], 'branches')),

  prototype: {
    _loadBranch: function(req, res, next) {
      req.container.query('Branch')
        .where({ id: req.params.id })
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
          req.container.create('Branch', req.body)
            .then(function (branch) {
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
