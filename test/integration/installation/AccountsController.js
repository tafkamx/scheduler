var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;
var url = container.props.url;

describe('Accounts Controller', function() {

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
  it('Should render /Accounts', function(done) {
    agent.get(url + '/Accounts').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.status).to.equal(200);

      done();
    });
  });

  it('Should render Accounts#show as 404 when no accountId', function(done) {
    agent.get(url + '/Accounts/show').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.instanceof(Error);
      expect(res.status).to.equal(404);
      done();
    });
  });

  it('Should render /Accounts/:id as JSON Object', function(done) {
    agent.get(url + '/Accounts/' + account1.id).set('Accept', 'application/json')
    .end(function(err, res) {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      done();
    });
  });

  it('Should render /Accounts/new', function(done) {
    agent.get(url + '/Accounts/new').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.eql(null);
      expect(res.status).to.equal(200);
      done();
    });
  });

  describe('#create', function() {

    it('Should create an Account', function(done) {
      agent.post(url + '/Accounts')
        .set('Accept', 'application/json')
        .send({branchName: 'default', type: 'teacher'})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.eql(200);
          expect(res.body.branchName).to.be.equal('default');
          expect(res.body.type).to.be.equal('teacher');
          done();
        });
    });

    it('Should fail if no branchName specified', function(done) {
      agent.post(url + '/Accounts')
        .set('Accept', 'application/json')
        .send({type: 'teacher'})
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.equal(500);
          done();
        });
    });

    it('Should fail if no type specified', function(done) {
      agent.post(url + '/Accounts')
      .set('Accept', 'application/json')
      .send({branchName: 'default'})
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(500);
        done();
      });
    });

  });

  describe('#edit', function() {

    it('Should render /Accounts/:id/edit', function(done) {
      agent.get(url + '/Accounts/' + account1.id + '/edit').set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        done();
      });
    });

    it('Should get the Account object /accounts/:id/edit', function(done) {
      agent.get(url + '/Accounts/' + account1.id + '/edit').set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        expect(res.body.type).to.be.equal('teacher');
        expect(res.body.branchName).to.be.equal('default');
        done();
      });
    });

    it('Should update Account attributes', function(done) {
      agent.put(url + '/Accounts/' + account1.id)
        .set('Accept', 'application/json')
        .send({ id: account1.id, firstName: 'Debra', type: 'teacher', branchName: 'default' })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.firstName).to.be.equal('Debra');
          done();
        });
    });

    it('Should support Account Type variable overloading', function(done) {
      agent.put(url + '/Accounts/' + account1.id)
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
        agent.post(url + '/Accounts/' + account1.id)
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
