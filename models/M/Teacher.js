/**
 *
 */
var Teacher = Class(M, 'Teacher').inherits(Krypton.Model)({
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
      var instance = this;
      return instance._container.get('TeacherAvailability').getTeacher(instance.id);
    },

    isAvailable: function(days, hours) {
      var instance = this;
      return instance._container.get('TeacherAvailability').isTeacherAvailable(instance.id, days, hours);
    },

    updateAvailability: function(days, hours) {
      var instance = this;
      return instance._container.get('TeacherAvailability').update(instance.id, days, hours);
    }
  }
});

module.exports = Teacher;
