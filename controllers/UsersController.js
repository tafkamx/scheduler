var path = require('path');

var UsersController = Class('UsersController').inherits(BaseController)({

  beforeActions : [
    // {
    //   before : [neonode.controllers.Home._authenticate],
    //   actions : ['index', 'create', 'edit', 'update', 'destroy']
    //
    // },
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
          req.user = result[0];

          delete res.locals.user.encryptedPassword;
          delete res.locals.user.token;

          next();
        })
        .catch(next);
    },

    index : function (req, res, next) {
      User.query(req.knex)
        .then(function(results) {
          results.forEach(function(result) {
            delete result.encryptedPassword;
            delete result.token;
          });

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
              delete user.encryptedPassword;
              delete user.token;
              delete user.password;

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
          req.user
            .updateAttributes(req.body)
            .save(req.knex)
            .then(function(val) {
              res.locals.user = new User(req.user);

              delete res.locals.user.encryptedPassword;
              delete res.locals.user.token;
              delete res.locals.user.password;

              res.json(res.locals.user);
            })
            .catch(next);
        }
      });
    },

    destroy : function (req, res, next) {
      res.format({
        json : function() {
          req.user.destroy(req.knex).then(function() {
            res.json({deleted: true});
          }).catch(next);
        }
      });
    }
  }
});

module.exports = new UsersController();
