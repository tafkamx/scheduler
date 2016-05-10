var Teacher = Class('TeacherAvailability').inherits(DynamicModel)({
  tableName: 'TeacherAvailability',

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
  ]
});
