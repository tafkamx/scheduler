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

  describe('#getAllAvailableOn', function() {

    it('Should return an Array of Account IDs', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn('default', 'monday', [2])
      .then(function(ids) {
        expect(ids).to.be.an('array');
        expect(ids.length).to.equal(1);
        done();
      });
    });

    it('Should resolve with empty Array if none found', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn(false, 'monday', [1, 2, 3])
      .then(function(ids) {
        expect(ids).to.be.an('array');
        expect(ids.length).to.equal(0);
        done();
      });
    });

    it('Should resolve with valid UUIDs from Accounts table', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn('default', 'monday', [2])
      .then(function(ids) {
        var id = ids[0];
        expect(id).to.equal(teacherId);
        done();
      });
    });

    it('Should work with branchName set to false or undefined', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn(false, 'monday', [2])
      .then(function(ids) {
        expect(ids).to.be.an('array');
        expect(ids.length).to.equal(1);
        done();
      });
    });

    it('Should work with Object for `days` and no `hours` set', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn('default', {'monday': 2})
      .then(function(ids) {
        expect(ids).to.be.an('array');
        expect(ids.length).to.equal(1);
        done();
      });
    });

    it('Should support multiple days', function(done) {
      container.get('TeacherAvailability').getAllAvailableOn('default', {'monday': 2, 'tuesday': 4})
      .then(function(ids) {
        expect(ids).to.be.an('array');
        expect(ids.length).to.equal(1);
        done();
      });
    });

  });

  // ======================================================================================

  describe('#isTeacherAvailabile', function() {

    it('Should resolve with Availability Object if available', function(done) {
      container.get('TeacherAvailability').isTeacherAvailable(teacherId, {'monday': 2, 'tuesday': 4})
      .then(function(availability) {
        expect(availability).to.be.an('object');
        expect(availability['monday']).to.be.an('array');
        expect(availability['monday'][2]).to.equal(true);
        expect(availability['monday'][3]).to.equal(false);
        done();
      });
    });

    it('Should resolve false if not available', function(done) {
      container.get('TeacherAvailability').isTeacherAvailable(teacherId, {'monday': 15, 'tuesday': 14})
      .then(function(availability) {
        expect(availability).to.equal(false);
        done();
      });
    });

  });

  // ======================================================================================

  describe('#update', function() {

    it('Should update a TeacherAvailability Object');

    it('Should automatically convert to bitmask');

    it('Should support updating all TeacherAvailability for an Account using an Object as main paramter')

  });

});
