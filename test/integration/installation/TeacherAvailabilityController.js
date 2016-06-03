var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;
var url = container.props.url;

describe('TeacherAvailability Controller', function() {

  var account1;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    container.create('Account', {
      branchName: 'default',
      type: 'teacher'
    }).then(function() {
      container.get('Account').query()
      .then(function(res) {
        account1 = res[0];
        done();
      }).catch(done);
    }).catch(done);
  });

  after(function(done) {
    container.get('Account').query().delete()
    .then(function() {
      done();
    }).catch(done);
  });
  /* === END Before/After Actions === */

  /* === Expect Statements === */

  describe('#getTeacher', function() {

    it('Should render /TeacherAvailability/getTeacher', function(done) {
      agent.get(url + '/TeacherAvailability/getTeacher').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });


  describe('#getAllAvailableOn', function() {

    it('Should render /TeacherAvailability/getAllAvailableOn', function(done) {
      agent.get(url + '/TeacherAvailability/getAllAvailableOn').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#isTeacherAvailable', function() {

    it('Should render /TeacherAvailability/isTeacherAvailable', function(done) {
      agent.get(url + '/TeacherAvailability/isTeacherAvailable').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#edit', function() {

    it('Should render /TeacherAvailability/edit', function(done) {
      agent.get(url + '/TeacherAvailability/1/edit').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });


});
