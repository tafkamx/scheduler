var adminUser = new AdminUser({
  email : 'test@example.com',
  password : '12345678'
});

var agent = sa.agent();

describe('InstallationAdmin.AdminUsers Controller', function() {

  before(function(done) {
    adminUser.save().then(function() {
      return adminUser;
    }).then(function(res) {
      res.activate().save().then(function() {
        agent.post(baseURL + '/InstallationAdmin/login')
          .send({ email: adminUser.email, password: '12345678'})
          .end(function(err, res) {
            done();
          });
      });
    });
  });

  it('Sould render /InstallationAdmin/AdminUsers/', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould get the AdminUsers Array from /InstallationAdmin/AdminUsers/', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        expect(res.body[0].encryptedPassword).to.be.undefined;
        expect(res.body[0].token).to.be.undefined;
        done();
      })
  });

  it('Sould render /InstallationAdmin/AdminUsers/:id', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Sould fail when a AdminUser.id doesnt exists /InstallationAdmin/AdminUsers/:id', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });

  });

  it('Sould get /InstallationAdmin/AdminUsers/:id', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body).to.be.an.object;
        expect(res.body.email).to.be.equal('test@example.com');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      });
  });

  it('Sould fail when a AdminUser.id doesnt exists /InstallationAdmin/AdminUsers/:id', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + '4f2b4747-4996-4542-bf54-7bc3247faa71')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Sould render /InstallationAdmin/AdminUsers/new', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/new')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould create a new AdminUser', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : 'test2@example.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.email).to.be.equal('test2@example.com');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould fail if the email exists', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : 'test2@example.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.email[0]).to.be.equal('The email already exists.');
        done();
      })
  });

  it('Sould fail if the email is no email', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : 'test2example.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.email[0]).to.be.equal('The email must be a valid email address');
        done();
      })
  });

  it('Sould fail if the email is empty', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : '',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.email[0]).to.be.equal('The email is required');
        done();
      })
  });

  it('Sould fail if the email is > 255', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfs@example.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.email[0]).to.be.equal('The email must not exceed 255 characters long');
        done();
      })
  });

  it('Sould fail if the password is < 8', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers')
      .set('Accept', 'application/json')
      .send({
        email : 'test3@example.com',
        password : '1234567'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.password[0]).to.be.equal('The password must be at least 8 characters long');
        done();
      })
  });

  it('Sould render /InstallationAdmin/AdminUsers/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Sould get the adminUser object /InstallationAdmin/AdminUsers/:id/edit', function(done) {
    agent.get(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id + '/edit')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(adminUser.id);
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould update adminUser attributes', function(done) {
    agent.put(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'application/json')
      .send({
        email : 'email@example.com',
        password : '123456789'
      })
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.body.errors).to.be.undefined;
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(adminUser.id);
        expect(res.body.email).to.be.equal('email@example.com');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould update adminUser attributes if its the same email', function(done) {
    agent.put(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'application/json')
      .send({
        password : 'abcdefghi'
      })
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.body.errors).to.be.undefined;
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(adminUser.id);
        expect(res.body.email).to.be.equal('email@example.com');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould fail update if email exists', function(done) {
    agent.put(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'application/json')
      .send({
        email : 'test2@example.com',
        password : 'abcdefghi'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.email[0]).to.be.equal('The email already exists.');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould fail update if password doesnt validate', function(done) {
    agent.put(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id)
      .set('Accept', 'application/json')
      .send({
        password : 'abcd'
      })
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(500);
        expect(err.response.body).to.exists;
        expect(err.response.body.password[0]).to.be.equal('The password must be at least 8 characters long');
        expect(res.body.encryptedPassword).to.be.undefined;
        expect(res.body.token).to.be.undefined;
        done();
      })
  });

  it('Sould destroy a record', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers/')
      .send({
        email : 'temp@example.com',
        password : '12345678'
      }).end(function(err, res) {
        agent.post(baseURL + '/InstallationAdmin/AdminUsers/' + res.body.id)
        .send({'_method' : 'DELETE'})
          .set('Accept', 'application/json')
          .end(function(err, res) {
            expect(err).to.be.eql(null);
            expect(res.body.deleted).to.be.equal(true);
            done();
          })
      });
  });

  it('Sould fail if id doesnt exist when destroy a record', function(done) {
    agent.post(baseURL + '/InstallationAdmin/AdminUsers/' + adminUser.id + '1')
    .send({'_method' : 'DELETE'})

      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        done();
      })
  });


  after(function(done) {
    AdminUser.query().delete().then(function() {
      return done();
    });
  });
});
