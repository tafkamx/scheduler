var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;

var url = container.props.url;

describe('Users Controller', function() {

  var user;

  // Create User for tests requiring existing user
  // Also used for login
  before(function (done) {
    Promise.resolve()
      .then(function () {
        return container
          .create('User', {
            email: 'franch@example.com',
            password: '12345678',
            role: 'franchisor',
          })
          .then(function (res) {
            user = res;

            return container.update(user.activate());
          });
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  // Login agent
  before(function (done) {
    Promise.resolve()
      .then(function (userId) {
        agent.post(url + urlFor.login())
          .send({
            email: 'franch@example.com',
            password: '12345678',
            role: 'franchisor',
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            done();
          });
      })
      .catch(done);
  });

  // Cleanup
  after(function(done) {
    return Promise.all([
      container.get('User').query().delete(),
    ])
      .then(function () {
        done();
      })
      .catch(done);
  });

  it('Should render /Users/', function(done) {
    agent.get(url + '/Users')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the Users Array from /Users', function(done) {
    agent.get(url + '/Users')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        expect(res.body.length).to.be.equal(1);
        done();
      });
  });

  it('Should render /Users/:id', function(done) {
    agent.get(url + '/Users/' + user.id)
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        done();
      });
  });

  it('Should return 404 when User.id doesnt exists in /Users/:id', function(done) {
    agent.get(url + '/Users/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.equal(404);
        done();
      });
  });

  it('Should get /Users/:id', function(done) {
    agent.get(url + '/Users/' + user.id)
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
    agent.get(url + '/Users/5f4e4bdc-cd56-4287-afe1-167f8709f0d7')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        expect(err).to.be.instanceof(Error);
        expect(res.status).to.be.eql(404);
        done();
      });
  });

  it('Should render /Users/new', function(done) {
    agent.get(url + '/Users/new')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      });
  });

  describe('#create', function () {

    it('Should create a new User', function(done) {
      var user;

      Promise.resolve()
        .then(function () {
          return new Promise(function (resolve) {
            agent.post(url + '/Users')
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
          return container.query('User')
            .where('id', id)
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

    it('Should fail if the email exists', function(done) {
      agent.post(url + '/Users')
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
      agent.post(url + '/Users')
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
      agent.post(url + '/Users')
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
      agent.post(url + '/Users')
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
      agent.post(url + '/Users')
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
    agent.get(url + '/Users/' + user.id + '/edit')
      .set('Accept', 'text/html')
      .end(function(err, res) {
        expect(err).to.be.eql(null);
        expect(res.status).to.be.eql(200);
        done();
      })
  });

  it('Should get the user object /Users/:id/edit', function(done) {
    agent.get(url + '/Users/' + user.id + '/edit')
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
      agent.put(url + '/Users/' + user.id)
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
      agent.put(url + '/Users/' + user.id)
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
      agent.put(url + '/Users/' + user.id)
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
      agent.post(url + '/Users')
        .send({
          email : 'temp@example.com',
          password : '12345678',
          role: 'student'
        }).end(function(err, res) {
          agent.post(url + '/Users/' + res.body.id)
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
      agent.post(url + '/Users/' + user.id + '1')
        .send({'_method' : 'DELETE'})
        .set('Accept', 'application/json')
        .end(function(err, res) {
          expect(err).to.be.instanceof(Error);
          done();
        })
    });

  });

});
