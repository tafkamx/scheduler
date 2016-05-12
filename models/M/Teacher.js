/**
 *
 */
var Teacher = Class(M, 'Teacher').inherits(DynamicModel)({
  tableName: 'Teachers',

  validations: {
    id: ['natural'], // This is using int value instead of UUID, because it's not necessary.
    accountId: ['uuid', 'required'],
    active: ['boolean'],
    baseWage: ['numeric']
  },

  attributes: [
    'id',
    'accountId',
    'active',
    'bio',
    'baseWage',
    'accountNumber',
    'voidCheck',
    'createdAt',
    'updatedAt'
  ],

  prototype: {
    init: function(config) {
      DynamicModel.prototype.init.call(this, config);
      var instance = this;

      instance.on('beforeCreate', function(next) {
        if(typeof instance.id !== 'number') delete instance.id; // This model uses incremental integer IDs
        instance.active = !!instance.active; // Force typing
        next();
      });
    },

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
