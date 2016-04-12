var path = require('path');

var UsersController = Class('UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before : ['_loadUser'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype : {
    _loadUser : function(req, res, next) {
      User.query(req.knex)
        .where('id', req.params.id)
        .then(function(result) {
          if (result.length === 0) {
            throw new NotFoundError('User ' + req.params.id + ' not found');
          }

          res.locals.user = result[0];

          next();
        })
        .catch(next);
    },

    index : function (req, res, next) {
      User.query(req.knex)
        .then(function(results) {
          res.locals.users = results;

          res.format({
            html : function() {
              res.render('Users/index.html');
            },
            json : function() {
              res.json(results);
            }
          });
        })
        .catch(next);
    },

    show : function (req, res, next) {
      res.format({
        html : function() {
          res.render('Users/show.html');
        },
        json : function() {
          res.json(res.locals.user);
        }
      });
    },

    new : function(req, res, next) {
      res.render('Users/new.html');
    },

    create : function (req, res, next) {
      res.format({
        json : function() {
          var user = new User(req.body);

          user
            .save(req.knex)
            .then(function() {
              res.json(user);
            })
            .catch(next);
        }
      });
    },

    edit : function (req, res, next) {
      res.format({
        html : function() {
          res.render('Users/edit.html');
        },
        json : function() {
          res.json(res.locals.user);
        }
      });
    },

    update : function (req, res, next) {
      res.format({
        json : function() {
          res.locals.user
            .updateAttributes(req.body)
            .save(req.knex)
            .then(function(val) {
              res.json(res.locals.user);
            })
            .catch(next);
        }
      });
    },

    destroy : function (req, res, next) {
      res.format({
        json : function() {
          res.locals.user
            .destroy(req.knex)
            .then(function() {
              res.json({ deleted: true });
            })
            .catch(next);
        }
      });
    }
  }
});

module.exports = new UsersController();
