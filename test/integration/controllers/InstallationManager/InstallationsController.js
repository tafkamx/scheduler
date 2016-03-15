var Promise = require('bluebird');

var adminUser = new AdminUser({
  email : 'test@example.com',
  password : '12345678'
});

var installation = new Installation({
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

  it('Sould render /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould get the Installations Array from /InstallationManager/Installations/', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        done();
      })
  });

  it('Sould render /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Sould fail when a installation.id doesnt exists /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });

  });

  it('Sould get /InstallationManager/Installations/:id', function(done) {
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

  it('Sould fail when a installation.id doesnt exists /InstallationManager/Installations/:id', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Sould render /InstallationManager/Installations/new', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/new')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould create a new Installation', function(done) {
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

  it('Sould fail to create an Installation if the name contains spaces', function(done) {
    var data = {
      name : 'my installation'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.name).to.be.equal('name must only contain alpha-numeric characters and dashes.');
        done();
      })
  });

  it('Sould fail to create an Installation if the nameis empty', function(done) {
    var data = {
      name : ''
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.name).to.be.equal('The name is required');
        done();
      })
  });

  it('Sould fail to create an Installation if the name is undefined', function(done) {
    var data = {
      name : undefined
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.name).to.be.equal('The name is required');
        done();
      })
  });

  it('Sould fail to create an Installation if the name exists', function(done) {
    var data = {
      name : 'installation-one',
      domain : 'empathia.academy'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.name).to.be.equal('name already exists.');
        expect(res.body.errors.domain).to.be.equal('domain already exists.');
        done();
      })
  });

  it('Sould fail to create an Installation if the domain is not a valid domain with tld', function(done) {
    var data = {
      name : 'my-installation',
      domain : 'myinstallation'
    };

    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.domain).to.be.equal('Invalid domain.');
        done();
      })
  });


  it('Sould fail if the name is > 128 or domain is > 255', function(done) {
    agent.post(baseURL + '/InstallationManager/Installations')
      .set('Accept', 'application/json')
      .send({
        name : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfs',
        domain : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfsexample.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(res.status).to.be.eql(200);
        expect(res.body.errors).to.exists;
        expect(res.body.errors.name).to.be.equal('The name must not exceed 128 characters long');
        expect(res.body.errors.domain).to.be.equal('The domain must not exceed 255 characters long');
        done();
      })
  });

  it('Sould render /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould get the installation object /InstallationManager/Installations/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationManager/Installations/' + installation.id + '/edit')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(installation.id);
        done();
      })
  });

  it('Sould update installation attributes', function(done) {
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

  it('Sould update installation attributes if send the same domain', function(done) {
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

  it('Sould fail update if name exists or domain exists', function(done) {
    Installation.query().where({
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
          expect(err).to.be.eql(null);
          expect(res.body.errors.name).to.be.equal('name already exists.');
          expect(res.body.errors.domain).to.be.equal('domain already exists.');
          done();
        })
    });

  });


  it('Sould destroy a record', function(done) {
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

  it('Sould fail if id doesnt exist when destroying a record', function(done) {
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
      AdminUser.query().delete(),
      // AdminUser.knex().raw('DROP DATABASE installation_one_test'),
      // AdminUser.knex().raw('DROP DATABASE installation_two_test'),
      // AdminUser.knex().raw('DROP DATABASE three_test'),
    ]).then(function() {
      return done();
    });
  });
});
