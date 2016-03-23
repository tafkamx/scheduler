var path = require('path');
var urlFor = CONFIG.router.helpers;

var BranchesController = Class('BranchesController').inherits(BaseController)({

  beforeActions: [
    // {
    //   before : [neonode.controllers.Home._authenticate],
    //   actions : ['index', 'create', 'edit', 'update', 'destroy']
    //
    // },
    {
      before: ['_loadBranch'],
      actions: ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype: {
    _loadBranch: function(req, res, next) {
      Branch.query(req.knex)
        .where({ id: req.params.id })
        .then(function (result) {
          if (result.length === 0) {
            throw new NotFoundError('Branch ' + req.params.id + ' not found');
          }

          res.locals.branch = result[0];
          req.branch = result[0];

          next();
        })
        .catch(next);
    },

    index: function (req, res, next) {
      Branch.query(req.knex)
        .then(function (results) {
          res.locals.branches = results;

          res.format({
            html: function () {
              neonode.app.emit('destroyKnex', req);
              res.render('Branches/index.html');
            },
            json: function () {
              neonode.app.emit('destroyKnex', req);
              res.json(results);
            }
          });
        })
        .catch(next);
    },

    show: function (req, res, next) {
      res.format({
        html: function () {
          neonode.app.emit('destroyKnex', req);
          res.render('Branches/show.html');
        },
        json: function () {
          neonode.app.emit('destroyKnex', req);
          res.json(res.locals.branch);
        }
      });
    },

    new: function (req, res, next) {
      neonode.app.emit('destroyKnex', req);
      res.render('Branches/new.html');
    },

    create: function (req, res, next) {
      res.format({
        json: function () {
          var branch = new Branch(req.body);

          branch
            .save(req.knex)
            .then(function () {
              neonode.app.emit('destroyKnex', req);
              res.json(branch);
            })
            .catch(next);
        }
      });
    },

    edit: function (req, res, next) {
      res.format({
        html: function () {
          neonode.app.emit('destroyKnex', req);
          res.render('Branches/edit.html');
        },
        json: function () {
          neonode.app.emit('destroyKnex', req);
          res.json(res.locals.branch);
        }
      });
    },

    update: function (req, res, next) {
      res.format({
        json: function () {
          req.branch
            .updateAttributes(req.body)
            .save(req.knex)
            .then(function (val) {
              neonode.app.emit('destroyKnex', req);
              res.json(res.locals.branch);
            })
            .catch(next);
        }
      });
    },

    destroy: function (req, res, next) {
      res.format({
        json: function () {
          req.branch
            .destroy(req.knex)
            .then(function () {
              neonode.app.emit('destroyKnex', req);
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }
});

module.exports = new BranchesController();