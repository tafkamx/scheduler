var path = require('path');
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

var TeacherAvailability = Class(M, 'TeacherAvailability').inherits(Krypton.Model)({
  tableName: 'TeacherAvailability',

  validations: {
    id: ['natural'],
    teacherId: ['uuid', 'required'], // Related to Account ID TODO: Do something similar to what Eduan did in Staff Members
    branchName: ['alphaDash', 'required'],
    monday: ['numeric'],
    tuesday: ['numeric'],
    wednesday: ['numeric'],
    thursday: ['numeric'],
    friday: ['numeric'],
    saturday: ['numeric'],
    sunday: ['numeric']
  },

  attributes: [
    'id',
    'teacherId',
    'branchName',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
    'createdAt',
    'updatedAt'
  ],

  /* Retrieves Availability Object for a Teacher Account */
  getTeacher: function(id) {
    var model = this;

    return new Promise(function(resolve, reject) {
      model._container.get('TeacherAvailability').query().where('teacher_id', id)
      .then(function(res) {
        var availability = res[0];
        if(!availability) reject(new Error('No availability for this ID.'));

        var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(function(o) {
          availability[o] = bitmasks.parseToArray(availability[o]);
        });

        resolve(availability);
      }).catch(reject);
    });
  },

  /* Retrieves a list of Teacher Account IDs that are available within the given parameters */
  getAllAvailableOn: function(branchName, days, hours) {
    var model = this;

    if(hours && typeof days !== 'object') {
      var d = {};
      days = days.split(',');
      days.forEach(function(o) {
        d[o] = hours;
      });
      days = d;
    }

    return new Promise(function(resolve, reject) {
      if(!days) reject(new Error('No query to run. Days: ' + days));

      var query = model._container.get('TeacherAvailability').query()

      if(branchName) query.where('branch_name', branchName);

      for(var day in days) {
        if(days.hasOwnProperty(day)) {
          var bitmask;

          if(Array.isArray(days[day]))
            bitmask = bitmasks.getBitmask.apply(null, days[day]).toString();
          else bitmask = bitmasks.getBitmask(days[day]);

          query.whereRaw(bitmask + ' & "' + day + '" = ' + bitmask);
        }
      }

      query.then(function (res) {
        var ids = [];
        res.forEach(function(o) {
          ids.push(o.teacherId);
        });

        resolve(ids);
      }).catch(reject);
    });

  },

  /* Determines if a Teacher Account is available wtihin the given parameters */
  isTeacherAvailable: function(teacherId, days, hours) {
    var model = this;

    if(hours && typeof days !== 'object') {
      var d = {};
      days = days.split(',');
      days.forEach(function(o) {
        d[o] = hours;
      });
      days = d;
    }

    return new Promise(function(resolve, reject) {
      if(!days) reject(new Error('No query to run. Days: ' + days));

      var query = model._container.get('TeacherAvailability').query()

      query.where('teacher_id', teacherId);

      for(var day in days) {
        if(days.hasOwnProperty(day)) {
          var bitmask;

          if(Array.isArray(days[day]))
            bitmask = bitmasks.getBitmask.apply(null, days[day]).toString();
          else bitmask = bitmasks.getBitmask(days[day]);

          query.whereRaw(bitmask + ' & "' + day + '" = ' + bitmask);
        }
      }

      query.then(function(res) {
        if(!res.length) resolve(false);
        else {
          availability = res[0];

          var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          days.forEach(function(o) {
            availability[o] = bitmasks.parseToArray(availability[o]);
          });

          resolve(availability);
        }
      }).catch(reject);
    });

  },

  prototype: {

    init: function(config) {
      DynamicModel.prototype.init.call(this, config);
      var instance = this;

      instance.on('beforeCreate', function(next) {
        if(typeof instance.id !== 'number') delete instance.id; // This model uses incremental integer IDs
        instance.active = !!instance.active; // Force typing
        next();
      });
    }

  }
});

module.exports = new TeacherAvailability();
