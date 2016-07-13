
describe('InstallationManager.UsersController', function () {

  var adminUser;

  // Admin user
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

  var agent = sa.agent();

  // Login agent
  before(function (done) {
    agent.post(baseURL + urlFor.InstallationManager.login.url())
      .send({
        email: adminUser.email,
        password: adminUser.password,
      })
      .end(done);
  });

  // Cleanup
  after(function () {
    return truncate(InstallationManager.User);
  });

  it('Should render /InstallationManager/Users/', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the Users Array from /InstallationManager/Users/', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.url())
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.length).to.be.eql(1);
        done();
      })
  });

  it('Should render /InstallationManager/Users/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.show.url(adminUser.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  it('Should fail when a adminUser.id doesnt exists /InstallationManager/Users/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.show.url('4f2b4747-4996-4542-bf54-7bc3247faa71'))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });

  });

  it('Should get /InstallationManager/Users/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.show.url(adminUser.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body).to.be.an.object;
        expect(res.body.email).to.be.equal('test@example.com');
        done();
      });
  });

  it('Should fail when a adminUser.id doesnt exists /InstallationManager/Users/:id', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.show.url('4f2b4747-4996-4542-bf54-7bc3247faa71'))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /InstallationManager/Users/new', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.new.url())
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should create a new User', function(done) {
    agent.post(baseURL + urlFor.InstallationManager.Users.url())
      .set('Accept', 'application/json')
      .send({
        email : 'test2@example.com',
        password : '12345678'
      })
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.email).to.be.equal('test2@example.com');
        done();
      })
  });

  it('Should render /InstallationManager/Users/:id/edit', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.edit.url(adminUser.id))
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the adminUser object /InstallationManager/Users/:id/edit', function(done) {
    agent.get(baseURL + urlFor.InstallationManager.Users.edit.url(adminUser.id))
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(adminUser.id);
        done();
      })
  });

  it('Should update adminUser attributes', function(done) {
    agent.put(baseURL + urlFor.InstallationManager.Users.show.url(adminUser.id))
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
        done();
      })
  });

  it('Should update adminUser attributes if its the same email', function(done) {
    agent.put(baseURL + urlFor.InstallationManager.Users.show.url(adminUser.id))
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
        done();
      })
  });

  it('Should destroy a record', function(done) {
    agent.post(baseURL + urlFor.InstallationManager.Users.create.url())
      .send({
        email : 'temp@example.com',
        password : '12345678'
      }).end(function(err, res) {
        agent.post(baseURL + urlFor.InstallationManager.Users.destroy.url(res.body.id))
        .send({'_method' : 'DELETE'})
          .set('Accept', 'application/json')
          .end(function(err, res) {
            expect(err).to.be.eql(null);
            expect(res.body.deleted).to.be.equal(true);
            done();
          })
      });
  });

  it('Should fail if id doesnt exist when destroy a record', function(done) {
    agent.post(baseURL + urlFor.InstallationManager.Users.destroy.url(adminUser.id + '1'))
      .send({'_method' : 'DELETE'})
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        done();
      })
  });

});
