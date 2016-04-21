var installation = 'installation-one';

var user, knex, Knex, knexConfig;

var websiteUrl = CONFIG[CONFIG.environment].defaultDomainName;
var installationUrl = 'http://default.' + installation + '.' + websiteUrl;

var agent = sa.agent();

var path = require('path');

var mailers = { user: new UserMailer({ installationUrl: 'something' }) };

describe('UsersController', function() {
  before(function(done) {
    Knex = require('knex');

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));

    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);

    Promise.resolve()
      .then(function () {
        user = new User({
          email : 'test.installation.one@example.com',
          password : '12345678',
          role: 'franchisor',
          mailers: mailers,
        });

        return user.save(knex);
      })
      .then(function (userId) {
        return User.query(knex)
          .where('id', userId[0])
          .then(function (result) {
            return new Promise(function (resolve, reject) {
              agent.get(installationUrl + '/login?email=false&token=' + result[0].token)
                .end(function (err, res) {
                  expect(err).to.equal(null);
                  expect(res.status).to.equal(200);

                  return resolve();
                });
            });
          });
      })
      .then(done)
      .catch(done);
  });

  it('Should render /Users/', function(done) {
    agent.get(installationUrl + '/Users')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the Users Array from /Users', function(done) {
    agent.get(installationUrl + '/Users')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        expect(res.body.length).to.be.equal(1);
        done();
      });
  });

  it('Should render /Users/:id', function(done) {
    agent.get(installationUrl + '/Users/' + user.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        done();
      });
  });

  it('Should return 404 when User.id doesnt exists in /Users/:id', function(done) {
    agent.get(installationUrl + '/Users/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(404);
        done();
      });
  });

  it('Should get /Users/:id', function(done) {
    agent.get(installationUrl + '/Users/' + user.id)
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body).to.be.an.object;
        expect(res.body.email).to.be.equal(user.email);
        done();
      });
  });

  it('Should fail to get if id doesnt exists /Users/:id', function(done) {
    agent.get(installationUrl + '/Users/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /Users/new', function(done) {
    agent.get(installationUrl + '/Users/new')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  describe('#create', function () {

    it('Should create a new User', function(done) {
      var user,
        userInfo;

      Promise.resolve()
        .then(function () {
          return new Promise(function (resolve) {
            agent.post(installationUrl + '/Users')
              .set('Accept', 'application/json')
              .send({
                email : 'test1@example.com',
                password : '12345678',
                role: 'staff'
              })
              .end(function(err, res) {
                expect(err).to.be.equal(null);
                expect(res.status).to.be.eql(200);
                expect(res.body.email).to.be.equal('test1@example.com');

                return resolve(res.body.id);
              })
          });
        })
        .then(function (id) {
          return User.query(knex)
            .where('id', id)
            .then(function (result) {
              expect(result.length).to.equal(1);

              user = result[0];
            });
        })
        .then(function () {
          return UserInfo.query(knex)
            .where('user_id', user.id)
            .then(function (result) {
              expect(result.length).to.equal(1);

              userInfo = result[0];
            });
        })
        .then(function () {
          expect(user.id).to.equal(userInfo.userId);
          expect(userInfo.role).to.equal('staff');

          return Promise.resolve();
        })
        .then(function () {
          return done();
        })
        .catch(done);
    });

    it('Should fail if the email exists', function(done) {
      agent.post(installationUrl + '/Users')
        .set('Accept', 'application/json')
        .send({
          email : 'test1@example.com',
          password : '12345678',
          role: 'staff'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.email[0]).to.be.equal('The email already exists.');
          done();
        });
    });

    it('Should fail if the email is no email', function(done) {
      agent.post(installationUrl + '/Users')
        .set('Accept', 'application/json')
        .send({
          email : 'test2example.com',
          password : '12345678',
          role: 'staff'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.email[0]).to.be.equal('The email must be a valid email address');
          done();
        })
    });

    it('Should fail if the email is empty', function(done) {
      agent.post(installationUrl + '/Users')
        .set('Accept', 'application/json')
        .send({
          email : '',
          password : '12345678',
          role: 'staff'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.email[0]).to.be.equal('The email is required');
          done();
        })
    });

    it('Should fail if the email is > 255', function(done) {
      agent.post(installationUrl + '/Users')
        .set('Accept', 'application/json')
        .send({
          email : 'jansfjknfdskjnfdskjsfndjkndjkdsnkjfnsdjknfjksdnfjkndsfkjndsjknfkjdsnjkfndskjnfjkdsnfjkndsjknfkjdsnfjkndsjknfjkdsnfjkndfsjknfkjdsnfjkndsjkfnjkdsnfjksdnkjfnskjnkjsndkjnjknsdkjfnkjsdnfkjnskjdnfjksdnkjfdnjksnfdjknsdjkfnkjsnfdkjnkjsdnfjkdsnkjnkjdsnjksndkjfndjksndfkjnfkjsdnfjknfsdkjnfkjfnjkfsdnkjfndskfjsnfkjsdnfdskjnfdskjndfskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjnfdskjndfskjndfkjndfkjdfnskjfdsnkjnfdkjndfskjndfskjndfskjndsfkjnfdskjndfskjnfdskjndfskjndfskjnfdskjndfskjndfskjndfskjndfs@example.com',
          password : '12345678',
          role: 'staff'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.email[0]).to.be.equal('The email must not exceed 255 characters long');
          done();
        });
    });

    it('Should fail if the password is < 8', function(done) {
      agent.post(installationUrl + '/Users')
        .set('Accept', 'application/json')
        .send({
          email : 'test3@example.com',
          password : '1234567',
          role: 'staff'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.password[0]).to.be.equal('The password must be at least 8 characters long');
          done();
        });
    });

  });

  it('Should render /Users/:id/edit', function(done) {
    agent.get(installationUrl + '/Users/' + user.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the user object /Users/:id/edit', function(done) {
    agent.get(installationUrl + '/Users/' + user.id + '/edit')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        expect(res.body.id).to.be.equal(user.id);
        done();
      })
  });

  describe('#update', function () {

    it('Should update user attributes', function(done) {
      agent.put(installationUrl + '/Users/' + user.id)
        .set('Accept', 'application/json')
        .send({
          email : 'email@example.com',
          password : '123456789'
        })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.id).to.be.equal(user.id);
          expect(res.body.email).to.be.equal('email@example.com');
          done();
        });
    });

    it('Should update user attributes if its the same email', function(done) {
      agent.put(installationUrl + '/Users/' + user.id)
        .set('Accept', 'application/json')
        .send({
          password : 'abcdefghi'
        })
        .end(function(err, res) {
          expect(err).to.be.eql(null);
          expect(res.body.errors).to.be.undefined;
          expect(res.status).to.be.eql(200);
          expect(res.body.id).to.be.equal(user.id);
          expect(res.body.email).to.be.equal('email@example.com');
          done();
        })
    });

    it('Should fail update if password doesnt validate', function(done) {
      agent.put(installationUrl + '/Users/' + user.id)
        .set('Accept', 'application/json')
        .send({
          password : 'abcd'
        })
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          expect(res.status).to.be.eql(500);
          expect(err.response.body).to.exists;
          expect(err.response.body.password[0]).to.be.equal('The password must be at least 8 characters long');
          done();
        })
    });

  });

  describe('#destroy', function () {

    it('Should destroy a record', function(done) {
      agent.post(installationUrl + '/Users')
        .send({
          email : 'temp@example.com',
          password : '12345678',
          role: 'student'
        }).end(function(err, res) {
          agent.post(installationUrl + '/Users/' + res.body.id)
            .send({'_method' : 'DELETE'})
            .set('Accept', 'application/json')
            .end(function(err, res) {
              expect(err).to.be.eql(null);
              expect(res.body.deleted).to.be.equal(true);
              done();
            })
        });
    });

    it('Should destroy UsersInfo record if User is destroyed', function(done) {
      agent.post(installationUrl + '/Users')
        .send({
          email: 'temp@example.com',
          password: '12345678',
          role: 'student'
        })
        .end(function(err, res) {
          Promise.resolve()
            .then(function () {
              return new Promise(function (resolve) {
                agent.post(installationUrl + '/Users/' + res.body.id)
                  .send({ _method: 'DELETE' })
                  .set('Accept', 'application/json')
                  .end(function(err, res) {
                    expect(err).to.be.eql(null);
                    expect(res.body.deleted).to.be.equal(true);

                    resolve();
                  });
              });
            })
            .then(function () {
              return UserInfo.query(knex)
                .where('user_id', res.id)
                .then(function (result) {
                  expect(result.length).to.equal(0);
                });
            })
            .then(done)
            .catch(done);
        });
    });

    it('Should fail if id doesnt exist when destroy a record', function(done) {
      agent.post(installationUrl + '/Users/' + user.id + '1')
      .send({'_method' : 'DELETE'})

        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        })
    });

  });

  after(function(done) {
    User.query(knex).delete().then(function() {
      return done();
    });
  });
});
