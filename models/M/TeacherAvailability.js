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

  getDefaultObj: function(id) {
    var a = {
      id: null,
      teacherId: id,
      branch: null,
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    };

    return a;
  },

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

        resolve(availability); // TODO make this an array of hours the Account is available at.
      }).catch(reject);
    });
  },

  /* Retrieves a list of Teacher Account IDs that are available within the given parameters */
  getAllAvailable: function(a, b, c) {

    return new Promise(function(resolve, reject) {
      //model._container.get('TeacherAvailability').query();
    });

  },

  /* Determines if a Teacher Account is available wtihin the given parameters */
  isTeacherAvailable: function(a, b, c) {

  },

  /* Update a Teacher's Availability on a particular day, many days, or all days */
  update: function() {

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
