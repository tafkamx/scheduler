var path = require('path');
var container = UNIT;
var uuid = require('uuid');

describe('M.Acccount', function() {
  var teacherAccount;

  before(function(done) {

    container.create('User', {
      email: 'user-account-test@example.com',
      password: '12345678'
    }).then(function(res) {
      container.create('Account', {
        userId: res.id,
        branchName: 'default',
        type: 'teacher'
      })
      .then(function() {
        return done();
      })
      .catch(done);

    });
  });

  after(function () {
    return Promise.all([
      container.get('Teacher').query().delete(),
      container.get('Account').query().delete(),
      container.get('User').query().delete(),
    ]);
  });

  it('Should have typeInfo related to User Type.', function(doneTest) {
     container.get('Account').query()
     .then(function(res) {
       teacherAccount = res[0];
       teacherAccount.getTypeInfo()
       .then(function() {
         expect(teacherAccount).to.have.ownProperty('branchName'); // This is an account-wide property
         expect(teacherAccount).to.have.ownProperty('active'); // bio is a Teacher-specific property.
         expect(teacherAccount.active).to.equal(false);
         doneTest();
       });
     });
  });

  it('Should work through `container.get(Account).getById`', function(doneTest) {
    container.get('Account').getById(teacherAccount.id)
    .then(function(account) {
      expect(account).to.have.ownProperty('active'); // This is a Teacher-specific property
      doneTest();
    });
  });


  it('Should work through `container.get(Account).getByUser`', function(doneTest) {
    container.get('Account').getByUser(teacherAccount.userId, teacherAccount.branchName) // Doesn't work within this class method
    .then(function(account) {
      expect(account).to.have.ownProperty('active'); // This is a Teacher-specific property
      doneTest();
    });
  });

  it('Should save Account Type data on save.', function(doneTest) {
    expect(teacherAccount.active).to.equal(false);
    teacherAccount.active = true; // Set in account scope
    expect(teacherAccount.typeInfo.active).to.equal(true); // Check typeInfo for update

    return container.update(teacherAccount)
    .then(function() { // Gotta recheck the database for update to Teacher
      container.get('Teacher').query().where('account_id', teacherAccount.id)
      .then(function(res) {
        expect(res[0].active).to.equal(true);
        doneTest();
      });
    }).catch(doneTest);
  });
});
