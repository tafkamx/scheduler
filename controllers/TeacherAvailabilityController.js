var path = require('path');
var Promise = require('bluebird');
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

var TeacherAvailabilityController = Class('TeacherAvailabilityController').inherits(RestfulController)({

  beforeActions: [
    {
      before: [ neonode.controllers['Accounts']._loadAccount ],
      actions: ['new', 'create', 'edit', 'update', 'destroy']
    }
  ],

  prototype: {

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
      }).catch(next);
    },

    /**
     * `TeacherAvailability.getAllAvailableOn` takes up to 3 arguments: `branchId`, `days`, and `hours`
     * Users of this Controller can send these parameters via HTTP POST or GET
     */
    getAllAvailableOn: function(req, res, next) {
      res.locals.branchId = req.query.branchId || false;
      res.locals.days = req.query.days;
      res.locals.hours = req.query.hours.split(',');

      req.container.get('TeacherAvailability').getAllAvailableOn(res.locals.branchId, res.locals.days, res.locals.hours)
      .then(function(ids) {
        res.locals.availability = ids;

        res.format({
          json: function() {
            res.json(res.locals.availability);
          },
          html: function() {
            res.render('TeacherAvailability/getAllAvailableOn.html');
          }
        });
      }).catch(next);
    },

    /**
     * `TeacherAvailability.isTeacherAvailable` takes up to 3 arguments: `id`, `days`, and `hours`
     * Users of this Controller can set these parameters via HTTP POST or GET
     */
    isTeacherAvailable: function(req, res, next) {
      res.locals.id = req.query.id;
      res.locals.days = req.query.days;
      res.locals.hours = req.query.hours.split(',');

      req.container.get('TeacherAvailability').isTeacherAvailable(res.locals.id, res.locals.days, res.locals.hours)
      .then(function(availability) {
        res.locals.availability = availability;

        res.format({
          json: function() {
            res.json(res.locals.availability);
          },
          html: function() {
            res.render('TeacherAvailability/isTeacherAvailable.html');
          }
        });

      }).catch(next);
    },

    // ===
    new: function(req, res, next) {
      res.format({
        html: function() {
          res.render('TeacherAvailability/new.html');
        }
      });
    },

    // ===
    create: function(req, res, next) {
      res.format({
        json: function () {
          req.container.create('TeacherAvailability', req.body)
            .then(function (account) {
              res.json(account);
            })
            .catch(next);
        }
      });
    },

    // ===
    edit: function(req, res, next) {
      req.container.get('TeacherAvailability').getTeacher(res.locals.account.id)
      .then(function(availability) {
        res.locals.availability = availability;

        res.format({
          json: function() {
            res.json(res.locals.availability);
          },
          html: function() {
            res.render('TeacherAvailability/edit.html');
          }
        });
      }).catch(next);
    },

    // ===
    update: function(req, res, next) {
      obj = {};

      res.format({
        json: function() {

          var days = ['teacherId', 'branchId', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          days.forEach(function(day) {
            if(req.body[day] && Array.isArray(req.body[day])) {
              obj[day] = [];

              for(var i = 0; i <= 23; i++)
                if(req.body[day][i])
                  obj[day].push(i);

              obj[day] = bitmasks.parseToBitmask(obj[day]);
            }

            else if(req.body[day]) obj[day] = req.body[day];
          });

          req.container.get('TeacherAvailability').query().where('teacher_id', res.locals.account.id)
          .then(function(availability) {
            availability = availability[0];

            req.container.update(availability, obj)
            .then(function(availability) {
              res.json(availability);
            }).catch(next);
          }).catch(next);

        }
      });
    },

    // ===
    destroy: function(req, res, next) {
      res.format({
        json : function() {
          req.container.get('TeacherAvailability').query().where('teacher_id', res.locals.id).delete()
          .then(function() {
            res.json({ deleted: true });
          }).catch(next);
        }
      });
    }

  }

});

module.exports = new TeacherAvailabilityController();
