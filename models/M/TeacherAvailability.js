var path = require('path');
var bitmask = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

var Teacher = Class('TeacherAvailability').inherits(Krypton.Model)({
  tableName: 'TeacherAvailability',

  validations: {
    id: ['natural'],
    teacherId: ['uuid', 'required'], // Related to Account ID TODO: Do something similar to what Eduan did in Staff Members
    branchId: ['uuid', 'required'],
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
    'account_id',
    'branch_id',
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
  getTeacher: function(account_id) {
    model = this;

    return new Promise(function(resolve, reject) {
      model._container.get('TeacherAvailability').query().where('teacher_id', account_id)
      .then(function(res) {
        var availability = res[0];
        if(!availability) return resolve(false); // TODO return an Object that shows the Account is not available at all

        resolve(availability); // TODO make this an array of hours the Account is available at.
      }).catch(reject);
    });
  },

  /* Retrieves a list of Teacher Account IDs that are available within the given parameters */
  getAllAvailable: function(a, b, c) {

  },

  /* Determines if a Teacher Account is available wtihin the given parameters */
  isTeacherAvailable: function(a, b, c) {

  },

  /* Update a Teacher's Availability on a particular day, many days, or all days */
  update: function() {

  }
});
