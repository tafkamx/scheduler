var urlFor = CONFIG.router.helpers;
describe('InstallationManager.InstallationsController', function () {

  var adminUser;

  // Admin user, to login
  before(function () {
    adminUser = new InstallationManager.User({
      email: 'test@example.com',
      password: '12345678',
    });

    return adminUser
      .save()
      .then(function () {
        return adminUser.activate().save();
      });
  });

  // Agent login
  var agent = sa.agent();

  before(function (done) {
    agent.post(baseURL + urlFor.InstallationManager.login.url())
      .send({
        email: adminUser.email,
        password: adminUser.password,
      })
      .end(function (err, res) {
        done(err);
      });
  });

  var installation;

  // Installation, test CRUD stuff
  before(function () {
    this.timeout(4000);

    var data = {
      installation: {
        name: 'installation-one',
      },
      franchisor: {
        email: 'test@example.org',
        password: '12345678',
      },
      installationSettings: {
        language: 'en-CA',
        currency: 'CAD',
        timezone: 'America/Toronto',
      },
      baseUrl: 'http://default.installation-one.test-installation.com:3000',
    };

    return InstallationManager.Installation.createInstallation(data)
      .then(function (res) {
        installation = res;
      });
  });

  // Cleanup
  after(function () {
    return Promise.all([
      InstallationManager.Installation.query()
        .where('name', 'not in', ['installation-inte', 'installation-unit'])
        .delete(),
      InstallationManager.User.query().delete(),
    ]);
  });

  it('Should render /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the Installations Array from /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.url())
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        done();
      });
  });

  it('Should render /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.show.url(installation.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should fail when a installation.id doesnt exists /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.show.url('4f2b4747-4996-4542-bf54-7bc3247faa71'))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should get /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.show.url(installation.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body).to.be.an.object;
        expect(res.body.name).to.be.equal(installation.name);
        done();
      });
  });

  it('Should fail when a installation.id doesnt exists /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.show.url('4f2b4747-4996-4542-bf54-7bc3247faa71'))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /InstallationManager/Installations/new', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.new.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  describe('#create', function () {
    this.timeout(4000);

    before(function () {
      return InstallationManager.Installation.query()
        .delete()
        .where('name', 'installation-two');
    });

    it('Should create a new Installation', function(done) {
      var data = {
        name : 'installation-two',
        domain : 'empathia.academy',
        franchisorEmail: 'franchisor@example.com',
        installationSettings : {
          language : 'en-CA',
          currency : 'CAD',
          timezone : 'America/Toronto'
        }
      };

      var knex, user;

      Promise.resolve()
        .then(function () {
          return new Promise(function (resolve, reject) {
            agent.post(baseURL + urlFor.InstallationManager.Installations.create.url())
              .set('Accept', 'application/json')
              .send(data)
              .end(function(err, res) {
                expect(err).to.eql(null);
                expect(res.status).to.be.eql(200);
                expect(res.body.name).to.be.equal(data.name);
                expect(res.body.domain).to.be.equal(data.domain);

                knex = new InstallationManager.Installation(res.body).getDatabase();

                return resolve();
              });
          });
        })
        .then(function () {
          return InstallationManager.User.query(knex)
            .then(function (result) {
              expect(result.length).to.equal(1);

              user = result[0];
            });
        })
        .then(function () {
          return done();
        })
        .catch(done);
    });

  });

  it('Should render /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.edit.url(installation.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the installation object /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Installations.edit.url(installation.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(installation.id);
        done();
      });
  });

  describe('#update', function () {

    it('Should update installation attributes', function(done) {
      var data = {
        domain : 'delagarza.io',
        installationSettings : {
          language : 'en-US',
          currency : 'USD',
          timezone : 'America/New_York'
        }
      };

      agent.put(baseURL + urlFor.InstallationManager.Installations.update.url(installation.id))
        .set('Accept', 'application/json')
        .send(data)
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.id).to.be.equal(installation.id);
          expect(res.body.domain).to.be.equal(data.domain);
          done();
        })
    });

    it('Should update installation attributes if send the same domain', function(done) {
      var data = {
        name : 'installation-one',
        domain : 'delagarza.io'
      };

      agent.put(baseURL + urlFor.InstallationManager.Installations.update.url(installation.id))
        .set('Accept', 'application/json')
        .send(data)
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.id).to.be.equal(installation.id);
          expect(res.body.name).to.be.equal(data.name);
          done();
        });
    });

    it('Should fail update if name exists or domain exists', function(done) {
      InstallationManager.Installation.query()
        .where('name', 'installation-two')
        .then(function(result) {
          var data = {
            name : 'installation-one',
            domain : 'delagarza.io'
          };

          agent.put(baseURL + urlFor.InstallationManager.Installations.update.url(result[0].id))
            .set('Accept', 'application/json')
            .send(data)
            .end(function(err, res) {
              expect(err).to.be.instanceof(Error);
              expect(res.status).to.be.eql(500);
              expect(err.response.body).to.exists;
              expect(err.response.body.name[0]).to.be.equal('name already exists.');
              expect(err.response.body.domain[0]).to.be.equal('domain already exists.');
              done();
            });
        })
        .catch(done);
    });

  });

  describe('#destroy', function () {
    this.timeout(4000);

    it('Should destroy a record', function(done) {
      agent.post(baseURL + urlFor.InstallationManager.Installations.url())
        .send({
          name: 'three',
          franchisorEmail: 'test@example.com',
          installationSettings : {
            language : 'en-CA',
            currency : 'CAD',
            timezone : 'America/Toronto'
          }
        })
        .end(function(err, res) {
          agent.post(baseURL + urlFor.InstallationManager.Installations.destroy.url(res.body.id))
            .send({ _method: 'DELETE'})
            .set('Accept', 'application/json')
            .end(function(err, res) {
              expect(err).to.be.eql(null);
              expect(res.body.deleted).to.be.equal(true);
              done();
            });
        });
    });

    it('Should fail if id doesnt exist when destroying a record', function(done) {
      agent.post(baseURL + urlFor.InstallationManager.Installations.destroy.url(installation.id + '1'))
        .send({ _method: 'DELETE'})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        })
    });

  });

});
