var Promise = require('bluebird');

var adminUser = new InstallationManager.User({
  email : 'test@example.com',
  password : '12345678'
});

var installation = new InstallationManager.Installation({
  name : 'installation-one'
});

var agent = sa.agent();

describe('InstallationManager.InstallationsController', function() {

  before(function(done) {
    adminUser.save().then(function() {
      return adminUser;
    }).then(function(res) {
      res.activate().save().then(function() {
        agent.post(baseURL + '/InstallationManager/login')
          .send({ email: adminUser.email, password: adminUser.password })
          .end(function(err, res) {
            installation.save().then(function() {
              done();
            }).catch(done);
          });
      })
    });
  });

  it('Should render /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the Installations Array from /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        done();
      })
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
      })
  });

  it('Should create a new Installation', function(done) {
    var data = {
      name : 'installation-two',
      domain : 'empathia.academy'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.name).to.be.equal(data.name);
        expect(res.body.domain).to.be.equal(data.domain);

        done();
      })
  });

  it('Should fail to create an Installation if the name contains spaces', function(done) {
    var data = {
      name : 'my installation'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.name[0]).to.be.equal('name must only contain alpha-numeric characters and dashes.');
        done();
      })
  });

  it('Should fail to create an Installation if the nameis empty', function(done) {
    var data = {
      name : ''
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.name[0]).to.be.equal('The name is required');
        done();
      })
  });

  it('Should fail to create an Installation if the name is undefined', function(done) {
    var data = {
      name : undefined
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.name[0]).to.be.equal('The name is required');
        done();
      })
  });

  it('Should fail to create an Installation if the name exists', function(done) {
    var data = {
      name : 'installation-one',
      domain : 'empathia.academy'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.name[0]).to.be.equal('name already exists.');
        expect(err.response.body.domain[0]).to.be.equal('domain already exists.');
        done();
      })
  });

  it('Should fail to create an Installation if the domain is not a valid domain with tld', function(done) {
    var data = {
      name : 'my-installation',
      domain : 'myinstallation'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.domain[0]).to.be.equal('Invalid domain.');
        done();
      })
  });


  it('Should fail if the name is > 128 or domain is > 255', function(done) {
    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send({
        name : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfs',
        domain : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfsexample.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.name[0]).to.be.equal('The name must not exceed 128 characters long');
        expect(err.response.body.domain[0]).to.be.equal('The domain must not exceed 255 characters long');
        done();
      })
  });

  it('Should render /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the installation object /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(installation.id);
        done();
      })
  });

  it('Should update installation attributes', function(done) {
    var data = {
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
        expect(res.body.domain).to.be.equal(data.domain);
        done();
      })
  });

  it('Should update installation attributes if send the same domain', function(done) {
    var data = {
      name : 'Installation-ONE',
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
      })
  });

  it('Should fail update if name exists or domain exists', function(done) {
    InstallationManager.Installation.query().where({
      name : 'installation-two'
    }).then(function(result) {
      var data = {
        name : 'Installation-ONE',
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
        })
    });

  });


  it('Should destroy a record', function(done) {
    agent.post(baseURL + '/InstallationManager/Installations/')
      .send({
        name : 'three'
      }).end(function(err, res) {
        agent.post(baseURL + '/InstallationManager/Installations/' + res.body.id)
        .send({'_method' : 'DELETE'})
          .set('Accept', 'application/json')
          .end(function(err, res) {
            expect(err).to.be.eql(null);
            expect(res.body.deleted).to.be.equal(true);
            done();
          })
      });
  });

  it('Should fail if id doesnt exist when destroying a record', function(done) {
    agent.post(baseURL + '/InstallationManager/Installations/' + installation.id + '1')
    .send({'_method' : 'DELETE'})

      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        done();
      })
  });


  after(function(done) {
    Promise.all([
      InstallationManager.User.query().delete(),
      // InstallationManager.User.knex().raw("update pg_database set datallowconn = false where datname = 'installation-one-test'"),
      // InstallationManager.User.knex().raw("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'installation-one-test'"),
      // InstallationManager.User.knex().raw("DROP DATABASE 'installation-one-test'"),
      // InstallationManager.User.knex().raw("update pg_database set datallowconn = false where datname = 'installation-two-test'"),
      // InstallationManager.User.knex().raw("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'installation-two-test'"),
      // InstallationManager.User.knex().raw("DROP DATABASE 'installation-two-test'"),
      // InstallationManager.User.knex().raw("update pg_database set datallowconn = false where datname = 'three-test'"),
      // InstallationManager.User.knex().raw("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'three-test'"),
      // InstallationManager.User.knex().raw("DROP DATABASE 'three-test'"),
    ]).then(function() {
      return done();
    }).catch(done);
  });
});