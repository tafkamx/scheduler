/**
 *
 */
var Teacher = Class('Teacher').inherits(DynamicModel)({
  tableName: 'Teachers',

  validations: {
    active: ['boolean'],
    baseWage: ['numeric']
  },

  attributes: [
    'id',
    'active',
    'bio',
    'baseWage',
    'accountNumber',
    'voidCheck',
    'createdAt',
    'updatedAt'
  ],

  prototype: {
    getAvailability: function() {

    },

    isAvailable: function(days, hours) {

    },

    updateAvailability: function(days, hours) {

    }
  }

  /*
  relations: {
    availability: {
      type: 'HasOne',
      relatedModel: TeacherAvailability,
      ownerCol: 'account_id',
      relatedCol: 'id'
    }
  }
  */
});

module.exports = Teacher;
