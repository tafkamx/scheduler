describe('InstallationManager.InstallationsController', function () {

  var adminUser;

  // Admin user, to login
  before(function (done) {
    adminUser = new InstallationManager.User({
      email: 'test@example.com',
      password: '12345678',
    });

    adminUser
      .save()
      .then(function () {
        return adminUser.activate().save();
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  // Agent login
  var agent = sa.agent();

  before(function (done) {
    agent.post(baseURL + '/InstallationManager/login')
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
  before(function (done) {
    installation = new InstallationManager.Installation({
      name: 'installation-one',
    });

    installation.save()
      .then(function () {
        var installationKnex = installation.getDatabase();

        var settings = new M.InstallationSettings({
          language: 'en-CA',
          currency: 'CAD',
          timezone: 'America/Toronto',
        });

        return settings.save(installationKnex)
          .then(function () {
            return installationKnex.destroy();
          });
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  // Cleanup
  after(function (done) {
    Promise.all([
      InstallationManager.Installation.query()
        .where('name', 'not in', ['installation-inte', 'installation-unit'])
        .delete(),
      InstallationManager.User.query().delete(),
    ])
      .then(function () {
        done();
      })
      .catch(done);
  });

  it('Should render /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the Installations Array from /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        done();
      });
  });

  it('Should render /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should fail when a installation.id doesnt exists /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should get /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id)
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
    agent.get(baseURL + '/InstallationManager/Installations/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /InstallationManager/Installations/new', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/new')
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

      var knex,
        user,
        userInfo;

      Promise.resolve()
        .then(function () {
          return new Promise(function (resolve, reject) {
            agent.post(baseURL + '/InstallationManager/Installations')
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
          return M.User.query(knex)
            .then(function (result) {
              expect(result.length).to.equal(1);

              user = result[0];
            });
        })
        .then(function () {
          return InstallationManager.UserInfo.query(knex)
            .then(function (result) {
              expect(result.length).to.equal(1);

              userInfo = result[0];
            });
        })
        .then(function () {
          expect(user.id).to.equal(userInfo.userId);
          expect(userInfo.role).to.equal('franchisor');

          return Promise.resolve();
        })
        .then(function () {
          return done();
        })
        .catch(function (err) {
          done(err)
        });
    });

  });

  it('Should render /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should get the installation object /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
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

      agent.put(baseURL + '/InstallationManager/Installations/' + installation.id)
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

      agent.put(baseURL + '/InstallationManager/Installations/' + installation.id)
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

          agent.put(baseURL + '/InstallationManager/Installations/' + result[0].id)
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
      agent.post(baseURL + '/InstallationManager/Installations/')
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
          agent.post(baseURL + '/InstallationManager/Installations/' + res.body.id)
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
      agent.post(baseURL + '/InstallationManager/Installations/' + installation.id + '1')
        .send({ _method: 'DELETE'})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        })
    });

  });

});
