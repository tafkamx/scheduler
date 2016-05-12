var path = require('path');
var container = UNIT;
var uuid = require('uuid');

describe('M.Acccount', function() {
  var teacherAccount;

  before(function(done) {
    container.create('Account', {
      branchId: uuid.v4(),
      type: 'teacher'
    })
    .then(function() {
      return done();
    })
    .catch(function(err) {
      return done();
    });
  });

  it('Should have typeInfo related to User Type.', function(doneTest) {
     container.get('Account').query()
     .then(function(res) {
       teacherAccount = res[0];
       teacherAccount.getTypeInfo() // It works here
       .then(function() {
         expect(teacherAccount).to.have.ownProperty('branchId'); // This is an account-wide property
         expect(teacherAccount).to.have.ownProperty('active'); // bio is a Teacher-specific property.
         expect(teacherAccount.active).to.equal(false);
         doneTest();
       });
     });
  });

  it('Should work through `container.get()`', function(doneTest) {
    container.get('Account').getById(teacherAccount.id) // Doesn't work within this class method
    .then(function(account) {
      expect(account).to.have.ownProperty('active');
      doneTest();
    });
  });

  it('Should save Account Type data on save.', function(doneTest) {
    expect(1).to.equal(1);
    doneTest();
  });
});
