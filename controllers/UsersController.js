var path = require('path');
var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

var UsersController = Class('UsersController').inherits(BaseController)({

  beforeActions : [
    {
      before : ['_loadUser'],
      actions : ['show', 'edit', 'update', 'destroy']
    },
    {
      before : function(req, res, next) {
        RESTFulAPI.createMiddleware({
          queryBuilder : req.container.query('User'),
          filters : {
            allowedFields : ['email']
          }
        })(req, res, next);
      },
      actions : ['index']
    }
  ],

  prototype : {
    _loadUser : function(req, res, next) {
      req.container.query('User')
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
      res.format({
        html : function() {
          res.render('Users/index.html', { users : res.locals.results });
        },
        json : function() {
          res.json(res.locals.results);
        }
      });
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
      return res.format({
        html: function () {
          res.render('Users/new.html');
        }
      });
    },

    create : function (req, res, next) {
      res.format({
        json : function() {
          req.container.create('User', req.body)
            .then(function (user) {
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
          req.container.update(res.locals.user, req.body)
            .then(function() {
              res.json(res.locals.user);
            })
            .catch(next);
        }
      });
    },

    destroy : function (req, res, next) {
      res.format({
        json : function() {
          req.container.destroy(res.locals.user)
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
