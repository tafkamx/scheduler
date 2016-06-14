'use strict';

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;

var url = container.props.url;

describe('Branches Controller', function () {

  var branch;

  // Create Branch for tests requiring existing branch
  before(function () {
    return container
      .create('Branch', {
        name: 'branch-one',
      })
      .then(function (res) {
        branch = res;
      });
  });

  // Create user for login
  before(function () {
    return container
      .create('User', {
        email: 'franch@example.com',
        password: '12345678',
      })
      .then(function (user) {
        return container.update(user.activate());
      });
  });

  var agent = sa.agent();

  // Login agent
  before(function () {
    return new Promise(function (resolve, reject) {
      agent.post(url + urlFor.login.url())
        .send({
          email: 'franch@example.com',
          password: '12345678',
        })
        .end(function (err, res) {
          if (err) { return reject(err); }

          resolve();
        });
    });
  });

  // Cleanup
  after(function () {
    return Promise.all([
      container.get('User').query().delete(),
      container.get('Branch').query().delete(),
    ]);
  });

  it('Should render /Branches/', function(done) {
    agent
      .get(url + urlFor.Branches.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the Branches Array from /Branches', function(done) {
    agent
      .get(url + urlFor.Branches.url())
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        expect(res.body.length).to.be.equal(1);
        done();
      });
  });

  it('Should render /Branches/:id', function(done) {
    agent
      .get(url + urlFor.Branches.show.url(branch.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        done();
      });
  });

  it('Should return 404 when Branch.id doesnt exists in /Branches/:id', function(done) {
    agent
      .get(url + urlFor.Branches.show.url('5f4e4bdc-cd56-4287-afe1-167f8709f0d7'))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(404);
        done();
      });
  });

  it('Should get /Branches/:id', function(done) {
    agent
      .get(url + urlFor.Branches.show.url(branch.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body).to.be.an.object;
        expect(res.body.name).to.be.equal(branch.name);
        done();
      });
  });

  it('Should fail to get if id doesnt exists /Branches/:id', function(done) {
    agent
      .get(url + urlFor.Branches.show.url('5f4e4bdc-cd56-4287-afe1-167f8709f0d7'))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /Branches/new', function(done) {
    agent
      .get(url + urlFor.Branches.new.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  describe('#create', function () {

    it('Should create a new Branch', function(done) {
      agent
        .post(url + urlFor.Branches.url())
        .set('Accept', 'application/json')
        .send({
          name: 'branch-two'
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.eql(200);
          expect(res.body.name).to.be.equal('branch-two');
          done();
        })
    });

  });

  it('Should render /Branches/:id/edit', function(done) {
    agent
      .get(url + urlFor.Branches.edit.url(branch.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the branch object /Branches/:id/edit', function(done) {
    agent
      .get(url + urlFor.Branches.edit.url(branch.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(branch.id);
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      });
  });

  it('Should update branch attributes', function(done) {
    agent
      .put(url + urlFor.Branches.update.url(branch.id))
      .set('Accept', 'application/json')
      .send({
        name: 'branch-1',
      })
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.body.errors).to.be.undefined;
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(branch.id);
        expect(res.body.name).to.be.equal('branch-1');
        done();
      });
  });

  it('Should destroy a record', function(done) {
    agent
      .post(url + urlFor.Branches.create.url())
      .send({
        name: 'branch-temp'
      })
      .end(function(err, res) {
        agent
          .post(url + urlFor.Branches.destroy.url(res.body.id))
          .send({
            _method: 'DELETE'
          })
          .set('Accept', 'application/json')
          .end(function(err, res) {
            expect(err).to.be.eql(null);
            expect(res.body.deleted).to.be.equal(true);
            done();
          });
      });
  });

  it('Should fail if id doesnt exist when destroy a record', function(done) {
    agent
      .post(url + urlFor.Branches.destroy.url(branch.id + '1'))
      .send({
        _method: 'DELETE'
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        done();
      });
  });

});
