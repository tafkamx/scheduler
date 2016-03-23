var installation = 'installation-one';

var branch, knex, Knex, knexConfig;

var websiteUrl = CONFIG[CONFIG.environment].defaultDomainName;
var installationUrl = 'http://default.' + installation + '.' + websiteUrl;

var agent = sa.agent();

var path = require('path');

describe('BranchesController', function() {
  before(function(done) {
    setTimeout(function() {
      Knex = require('knex');

      knexConfig = require(path.join(process.cwd(), 'knexfile.js'));

      knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

      knex = new Knex(knexConfig[CONFIG.environment]);

      branch = new Branch({
        name: 'branch-one'
      });

      branch
        .save(knex)
        .then(function () {
          return done();
        });

    }, 1000);

  });

  it('Should render /Branches/', function(done) {
    agent
      .get(installationUrl + '/Branches')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the Branches Array from /Branches', function(done) {
    agent
      .get(installationUrl + '/Branches')
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
      .get(installationUrl + '/Branches/' + branch.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        done();
      });
  });

  it('Should return 404 when Branch.id doesnt exists in /Branches/:id', function(done) {
    agent
      .get(installationUrl + '/Branches/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(404);
        done();
      });
  });

  it('Should get /Branches/:id', function(done) {
    agent
      .get(installationUrl + '/Branches/' + branch.id)
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
      .get(installationUrl + '/Branches/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /Branches/new', function(done) {
    agent
      .get(installationUrl + '/Branches/new')
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
        .post(installationUrl + '/Branches')
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

    it('Should fail if the name exists', function(done) {
      agent
        .post(installationUrl + '/Branches')
        .set('Accept', 'application/json')
        .send({
          name: 'branch-two'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.name[0]).to.be.equal('The name already exists.');
          done();
        });
    });

    it('Should fail if the name is empty', function(done) {
      agent
        .post(installationUrl + '/Branches')
        .set('Accept', 'application/json')
        .send({
          name: ''
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.name[0]).to.be.equal('The name is required');
          done();
        });
    });

    it('Should fail if the name is > 255', function(done) {
      agent
        .post(installationUrl + '/Branches')
        .set('Accept', 'application/json')
        .send({
          name: 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfsasdfasdfasdf'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.name[0]).to.be.equal('The name must not exceed 255 characters long');
          done();
        });
    });

    it('Should fail if the name contains non-alpha-numeric characters', function (done) {
      agent
        .post(installationUrl + '/Branches')
        .set('Accept', 'application/json')
        .send({
          name: 'abcd123$'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.name[0]).to.be.equal('name must only contain alpha-numeric characters and dashes.');
          done();
        });
    });

  });

  it('Should render /Branches/:id/edit', function(done) {
    agent
      .get(installationUrl + '/Branches/' + branch.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the branch object /Branches/:id/edit', function(done) {
    agent
      .get(installationUrl + '/Branches/' + branch.id + '/edit')
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
      .put(installationUrl + '/Branches/' + branch.id)
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
      .post(installationUrl + '/Branches')
      .send({
        name: 'branch-temp'
      })
      .end(function(err, res) {
        agent
          .post(installationUrl + '/Branches/' + res.body.id)
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
      .post(installationUrl + '/Branches/' + branch.id + '1')
      .send({
        _method: 'DELETE'
      })
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        done();
      });
  });

  after(function(done) {
    Branch.query(knex)
      .delete()
      .then(function () {
        return done();
      });
  });
});
