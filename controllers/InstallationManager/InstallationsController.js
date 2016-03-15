var path = require('path');
var urlFor = require(path.join(process.cwd(), 'config', 'routeMapper.js')).helpers;

InstallationManager.InstallationsController = Class(InstallationManager, 'InstallationsController').inherits(BaseController)({

  beforeActions : [
    {
      before : [neonode.controllers.Home._authenticate],
      actions : ['index', 'show', 'create', 'edit', 'update', 'destroy']

    },
    {
      before : ['_loadResource'],
      actions : ['show', 'edit', 'update', 'destroy']
    }
  ],

  prototype : {
    _loadResource : function(req, res, next) {
      Installation.query().where({id : req.params.id}).then(function(result) {

        if (result.length === 0) {
          throw new NotFoundError('Installation ' + req.params.id + ' not found');
        }

        req.installation = result[0];
        next();
      }).catch(function(err) {
        next(err)
      });
    },

    index : function index(req, res, next) {
      Installation.query().then(function(results) {
        res.format({
          html : function() {
            res.render('InstallationAdmin/Installations/index.html', {installations : results});
          },
          json : function() {
            res.json(results);
          }
        });
      }).catch(next);
    },

    show : function show(req, res, next) {
      res.format({
        html : function() {
          res.render('InstallationAdmin/Installations/show.html', { installation : req.installation});
        },
        json : function() {
          res.json(req.installation);
        }
      });
    },

    new : function(req, res, next) {
      res.render('InstallationAdmin/Installations/new.html');
    },

    create : function create(req, res, next) {
      res.format({
        json : function() {
          var installation = new Installation(req.body);

          installation.save().then(function() {
            res.json(installation);
          }).catch(next);
        }
      });
    },

    edit : function edit(req, res, next) {
      res.format({
        html : function() {
          res.render('InstallationAdmin/Installations/edit.html', { installation : req.installation });
        },
        json : function() {
          res.json(req.installation);
        }
      });
    },

    update : function update(req, res, next) {
      res.format({
        json : function() {
          req.installation.updateAttributes(req.body).save().then(function(val) {
            res.json(req.installation);
          }).catch(next);
        }
      });
    },

    destroy : function destroy(req, res, next) {
      res.format({
        json : function() {
          req.installation.destroy().then(function() {
            res.json({deleted: true});
          }).catch(next);
        }
      });
    }
  }
});

module.exports = new InstallationManager.InstallationsController();
