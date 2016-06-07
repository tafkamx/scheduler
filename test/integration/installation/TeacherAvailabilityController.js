var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;
var url = container.props.url;
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

describe('TeacherAvailability Controller', function() {

  var account1;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    var c = container.create('Account', {
      branchName: 'default',
      type: 'teacher'
    });

    c.then(function() {
      container.get('Account').query()
      .then(function(res) {
        account1 = res[0];

        container.create('TeacherAvailability', {
          teacherId: account1.id,
          branchName: account1.branchName,
          monday: bitmasks.getBitmask(2),
          tuesday: bitmasks.getBitmask(4)
        }).then(function() {
          done();
        }).catch(done);

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
      agent.get(url + '/TeacherAvailability/getTeacher?id=' + account1.id).set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });


  describe('#getAllAvailableOn', function() {

    it('Should render /TeacherAvailability/getAllAvailableOn', function(done) {
      agent.get(url + '/TeacherAvailability/getAllAvailableOn?days=monday&hours=2').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#isTeacherAvailable', function() {

    it('Should render /TeacherAvailability/isTeacherAvailable', function(done) {
      agent.get(url + '/TeacherAvailability/isTeacherAvailable?id=' + account1.id + '&days=monday&hours=2').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#edit', function() {

    it('Should render /TeacherAvailability/:id/edit', function(done) {
      agent.get(url + '/TeacherAvailability/' + account1.id + '/edit').set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });


});
