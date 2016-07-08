var agent = sa.agent();

var container = INTE;
var path = require('path');

var url = container.props.url;
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

describe('TeacherAvailability Controller', function() {

  var account1;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    var c = container.create('Account', {
      branchId: container.props.defaultBranchId,
      type: 'Teacher'
    });

    c.then(function() {
      container.get('Account').query()
      .then(function(res) {
        account1 = res[0];

        container.create('TeacherAvailability', {
          teacherId: account1.id,
          branchId: account1.branchId,
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
      agent.get(url + urlFor.TeacherAvailability.getTeacher.url() + '?id=' + account1.id).set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });


  describe('#getAllAvailableOn', function() {

    it('Should render /TeacherAvailability/getAllAvailableOn', function(done) {
      agent.get(url + urlFor.TeacherAvailability.getAllAvailableOn.url() + '?days=monday&hours=2').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#isTeacherAvailable', function() {

    it('Should render /TeacherAvailability/isTeacherAvailable', function(done) {
      agent.get(url + urlFor.TeacherAvailability.isTeacherAvailable.url() + '?id=' + account1.id + '&days=monday&hours=2').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#new', function() {

    it('Should render /TeacherAvailability/new', function(done) {
      agent.get(url + urlFor.TeacherAvailability.new.url()).set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#create', function() {

    it('Should create a new TeacherAvailability instance', function(done) {
      agent.post(url + urlFor.TeacherAvailability.create.url())
        .set('Accept', 'application/json')
        .send({ teacherId: account1.id, branchId: container.props.defaultBranchId, monday: (2 + 4 + 8) })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.eql(200);
          expect(res.body.branchId).to.be.equal(container.props.defaultBranchId);
          expect(res.body.monday).to.equal(14);
          done();
        });
    });

  });

  describe('#edit', function() {

    it('Should render /TeacherAvailability/:id/edit', function(done) {
      agent.get(url + urlFor.TeacherAvailability.edit.url(account1.id)).set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.equal(200);

        done();
      });
    });

  });

  describe('#update', function() {

    it('Should update a TeacherAvailability instance', function(done) {

      agent.put(url + urlFor.TeacherAvailability.update.url(account1.id)).set('Accept', 'application/json')
        .send({ monday: 4 })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.teacherId).to.be.equal(account1.id);
          expect(res.body.monday).to.be.equal(4);
          done();
        });
    });

    it('Should fail with invalid teacherId', function(done) {
      agent.put(url + urlFor.TeacherAvailability.update.url(account1.id)).set('Accept', 'application/json')
        .send({ teacherId: 'id' })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        });
    });

    it('Should fail with invalid bitmask/Array', function(done) {
      agent.put(url + urlFor.TeacherAvailability.update.url(account1.id)).set('Accept', 'application/json')
        .send({ monday: 'false' })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        });
    });


  });

  describe('#destroy', function() {

    it('Should destroy the Availability related to the request', function(done) {
        agent.post(url + urlFor.TeacherAvailability.destroy.url(account1.id))
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
