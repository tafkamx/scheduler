var path = require('path');
var Promise = require('bluebird');
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

var TeacherAvailabilityController = Class('TeacherAvailabilityController').inherits(RestfulController)({

  beforeActions: [
    {
      before: ['_loadAccount'],
      actions: ['edit', 'update', 'destroy']
    }
  ],

  prototype: {

    _loadAccount: function(req, res, next) { // This function does not get called for the first 3 action functions, due to how they are queued.
      return AccountsController.prototype._loadAccount(req, res, next); // Reusing Accounts Controller Code
    },

    /**
     * `TeacherAvailability.getTeacher()` only supports one parameter; `id`.
     * Users of this Controller can post the UUID for the Account related to the Availability they want to retrieve to this endpoint.
     */
    getTeacher: function(req, res, next) {
      if(!res.locals.id && req.query.id) res.locals.id = req.query.id.trim();
      if(!res.locals.id) throw new NotFoundError('Unable to find `id` parameter to perform query.');

      req.container.get('TeacherAvailability').getTeacher(res.locals.id)
      .then(function(availability) {
        res.locals.availability = availability;

        res.format({
          json: function() {
            res.json(res.locals.availability);
          },
          html: function() {
            res.render('TeacherAvailability/getTeacher.html');
          }
        });
      });
    },

    getAllAvailableOn: function(req, res, next) {
      res.format({
        json: function() {
          res.json(res.locals.availability);
        },
        html: function() {
          res.render('TeacherAvailability/getAllAvailableOn.html');
        }
      });
    },

    isTeacherAvailable: function(req, res, next) {
      res.format({
        json: function() {
          res.json(res.locals.availability);
        },
        html: function() {
          res.render('TeacherAvailability/isTeacherAvailable.html');
        }
      });
    },

    edit: function(req, res, next) {
      res.format({
        json: function() {
          res.json(res.locals.availability);
        },
        html: function() {
          res.render('TeacherAvailability/edit.html');
        }
      });
    },

    update: function(req, res, next) {
      // TODO
    },

    destroy: function(req, res, next) {
      // TODO

      res.format({
        json : function() {

          req.container.destroy(res.locals.availability)
            .then(function() {
              res.json({ deleted: true });
            })
            .catch(next);

        }
      });
    }

  }

});

module.exports = new TeacherAvailabilityController();
