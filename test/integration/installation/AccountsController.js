var agent = sa.agent();

var container = INTE;
var path = require('path');

var url = container.props.url;

describe('Accounts Controller', function() {

  var account1;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    container.create('Account', {
      branchId: container.props.defaultBranchId,
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
  it('Should render /Accounts', function(done) {
    agent.get(url + urlFor.Accounts.url()).set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.status).to.equal(200);

      done();
    });
  });

  it('Should render Accounts#show as 404 when no accountId', function(done) {
    agent.get(url + urlFor.Accounts.show.url('undefined')).set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.instanceof(Error);
      expect(res.status).to.equal(404);
      done();
    });
  });

  it('Should render /Accounts/:id as JSON Object', function(done) {
    agent.get(url + urlFor.Accounts.show.url(account1.id)).set('Accept', 'application/json')
    .end(function(err, res) {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      done();
    });
  });

  it('Should render /Accounts/new', function(done) {
    agent.get(url + urlFor.Accounts.new.url()).set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.eql(null);
      expect(res.status).to.equal(200);
      done();
    });
  });

  describe('#create', function() {

    it('Should create an Account', function(done) {
      agent.post(url + urlFor.Accounts.create.url())
        .set('Accept', 'application/json')
        .send({
          branchId: container.props.defaultBranchId,
          type: 'teacher',
          location: {
            name: 'something',
            address1: 'something',
            address2: 'something',
            city: 'something',
            state: 'something',
            country: 'something',
            postalCode: 'something',
            latitude: 'something',
            longitude: 'something',
          },
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.eql(200);
          expect(res.body.branchId).to.be.equal(container.props.defaultBranchId);
          expect(res.body.type).to.be.equal('teacher');

          container.query('Account')
            .where('id', res.body.id)
            .include('location')
            .then(function (res) {
              expect(res[0].location).to.exist;
              expect(res[0].location.id).to.exist;
              done();
            });
        });
    });

    it('Should fail if no branchId specified', function(done) {
      agent.post(url + urlFor.Accounts.create.url())
        .set('Accept', 'application/json')
        .send({type: 'teacher'})
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.equal(500);
          done();
        });
    });

    it('Should fail if no type specified', function(done) {
      agent.post(url + urlFor.Accounts.create.url())
      .set('Accept', 'application/json')
      .send({branchId: container.props.defaultBranchId})
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(500);
        done();
      });
    });

  });

  describe('#edit', function() {

    it('Should render /Accounts/:id/edit', function(done) {
      agent.get(url + urlFor.Accounts.edit.url(account1.id)).set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        done();
      });
    });

    it('Should get the Account object /accounts/:id/edit', function(done) {
      agent.get(url + urlFor.Accounts.edit.url(account1.id)).set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body.type).to.be.equal('teacher');
        expect(res.body.branchId).to.be.equal(container.props.defaultBranchId);
        done();
      });
    });

    it('Should update Account attributes', function(done) {
      agent.put(url + urlFor.Accounts.update.url(account1.id))
        .set('Accept', 'application/json')
        .send({ id: account1.id, firstName: 'Debra', type: 'teacher', branchId: container.props.defaultBranchId })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.firstName).to.be.equal('Debra');
          done();
        });
    });

    it('Should support Account Type variable overloading', function(done) {
      agent.put(url + urlFor.Accounts.update.url(account1.id))
        .set('Accept', 'application/json')
        .send({ active: true })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.active).to.be.equal(true);
          done();
        });
    });

  });

  describe('#create', function() {

    it('Should destroy the Account related to the request', function(done) {
        agent.post(url + urlFor.Accounts.destroy.url(account1.id))
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
