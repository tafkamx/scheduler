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

  describe('#new', function() {

    it('Should render /TeacherAvailability/new', function(done) {
      agent.get(url + '/TeacherAvailability/new').set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#create', function() {

    it('Should create a new TeacherAvailability instance', function(done) {
      agent.post(url + '/TeacherAvailability')
        .set('Accept', 'application/json')
        .send({ teacherId: account1.id, branchName: 'default', monday: (2 + 4 + 8) })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.eql(200);
          expect(res.body.branchName).to.be.equal('default');
          expect(res.body.monday).to.equal(14);
          done();
        });
    });

  });

  describe('#edit', function() {

    it('Should render /TeacherAvailability/:id/edit (currently does not work without passing via GET). Bug?', function(done) {
      agent.get(url + '/TeacherAvailability/' + account1.id + '/edit?id=' + account1.id).set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#update', function() {

    it('Should update a TeacherAvailability instance');
    it('Should fail with invalid teacherId');
    it('Should fail with invalid branchId');
    it('Should fail with invalid bitmasks/array');

  });

  describe('#destroy', function() {

    it('Should destroy the Availability related to the request', function(done) {
        agent.post(url + '/TeacherAvailability/' + account1.id)
        .send({ _method: 'DELETE' })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.deleted).to.be.equal(true);
          done();
        });
      });

  });

});
