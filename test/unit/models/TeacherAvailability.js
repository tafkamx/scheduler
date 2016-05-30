var path = require('path');
var container = UNIT;
var uuid = require('uuid');
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

describe('M.TeacherAvailability', function() {

  /* === BEFORE/AFTER ACTIONS === */

  var teacherId; // Gets set in `container.create('Account')`

  before(function(done) {
    container.create('User', {
      email: 'user-account-test@example.com',
      password: '12345678'
    }).then(function(user) {
      container.create('Account', {
        userId: user.id,
        branchName: 'default',
        type: 'teacher'
      }).then(function(account) {
        teacherId = account.id;

        container.create('TeacherAvailability', {
          teacherId: account.id,
          branchName: account.branchName,
          monday: bitmasks.getBitmask(2),
          tuesday: bitmasks.getBitmask(4)
        }).then(function() {
          done();
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  after(function() {
    return Promise.all([
      container.get('Teacher').query().delete(),
      container.get('TeacherAvailability').query().delete(),
      container.get('Account').query().delete(),
      container.get('User').query().delete(),
    ]);
  });

  /* === END BEFORE/AFTER ACTIONS === */

  // ======================================================================================

  describe('#getTeacher', function() {

    it('Should provide a TeacherAvailability Object with bitmasks parsed', function(done) {
      container.get('TeacherAvailability').getTeacher(teacherId)
      .then(function(availability) {
        expect(availability).to.be.an('object');
        expect(availability['monday'][2]).to.equal(true);
        expect(availability['monday'][3]).to.equal(false);
        expect(availability['friday'][15]).to.equal(false);
        done();
      }).catch(done);
    });

    it('Should reject with error if no entry for Teacher ID', function(done) {
      container.get('TeacherAvailability').getTeacher(uuid.v4())
      .then(function(availability) {
        expect.fail('Should have failed with invalid UUID.');
      }).catch(function(err) {
        expect(err).to.be.an('error');
        done();
      });
    });

  });

  // ======================================================================================

  describe('#getAllAvailable', function() {

    it('Should return an Array of Account IDs', function(done) {
      done();
    });

  });

  // ======================================================================================

  describe('#isTeacherAvailabile', function() {

  });

  // ======================================================================================

  describe('#update', function() {

  });

});
