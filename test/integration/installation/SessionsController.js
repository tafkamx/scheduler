var path = require('path');
var moment = require('moment');

var DomainContainer = require('domain-container');

// Containers
var cont1,
  cont2;

var _ = require('lodash');
var Promise = require('bluebird');

var agent1 = sa.agent();
var agent2 = sa.agent();

var urlFor = CONFIG.router.helpers;

describe('Sessions Controller', function () {

  var oneUrl,
    twoUrl;

  // Create installations and DomainContainers
  before(function (done) {
    var inst1 = new InstallationManager.Installation({
      name: 'installation-one',
    });

    var inst2 = new InstallationManager.Installation({
      name: 'installation-two',
    });

    Promise.resolve()
      .then(function () {
        return Promise.all([
          inst1.save(),
          inst2.save(),
        ]);
      })
      .then(function () {
        cont1 = new DomainContainer({
          knex: inst1.getDatabase(),
          models: M,
          props: {
            url: 'http://default.installation-one.test-installation.com:3000',
          },
          modelExtras: {
            mailers: {
              user: new UserMailer({
                baseUrl: 'http://default.installation-inte.test-installation.com:3000',
              }),
            },
          },
        });

        cont2 = new DomainContainer({
          knex: inst2.getDatabase(),
          models: M,
          props: {
            url: 'http://default.installation-two.test-installation.com:3000',
          },
          modelExtras: {
            mailers: {
              user: new UserMailer({
                baseUrl: 'http://default.installation-inte.test-installation.com:3000',
              }),
            },
          },
        });

        oneUrl = cont1.props.url;
        twoUrl = cont2.props.url;
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  var user1, user2;

  // Create users used in tests
  before(function (done) {
    this.timeout(4000);

    Promise.resolve()
      .then(function () {
        return cont1.create('User', {
          email: 'franch@example.com',
          password: '12345678',
          role: 'franchisor',
        });
      })
      .then(function (user) {
        user1 = user;
      })
      .then(function () {
        return cont2.create('User', {
          email: 'franch@example.com',
          password: '12345678',
          role: 'franchisor',
        });
      })
      .then(function (user) {
        return cont2.update(user.activate());
      })
      .then(function (user) {
        user2 = user;
      })
      .then(function () {
        done();
      })
      .catch(done);
  });

  after(function () {
    return promiseSeries([
      cont1.get('User').query().delete(),
      cont1.get('ResetPasswordToken').query().delete(),
      cont2.get('User').query().delete(),
      cont2.get('ResetPasswordToken').query().delete(),
      InstallationManager.Installation.query()
        .where('name', 'not in', ['installation-inte', 'installation-unit'])
        .delete(),
    ]);
  });

  describe('Login', function () {

    it('Should fail login because the account has not been activated', function(done) {
      sa.agent().post(oneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('User not activated')).to.not.equal(-1);
          done();
        });
    });

    it('Should login and activate with the users token', function(done) {
      sa.agent().get(oneUrl + '/login?email=false&token=' + user1.token)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);
        done();
      })

    });

    it('Should login with the email/password', function(done) {
      sa.agent().post(oneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);
          done();
        });
    });

    it('Should not let a logged in user login', function(done) {
      var agent = sa.agent();
      agent.post(oneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);

          agent.get(oneUrl + '/login')
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.status).to.be.equal(200);
            expect(res.text.search('"info": "You are already logged in"')).to.not.equal(-1);
            done();
          })

        });
    });

    it('Should not be logged-in in other installations', function(done) {
      var agent = sa.agent();

      agent.post(oneUrl + '/login')
        .send({
          email : user1.email,
          password : user1.password
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);

          agent.get(twoUrl + '/login')
            .end(function(err, res) {
              expect(err).to.be.equal(null);
              expect(res.status).to.be.equal(200);
              expect(res.text.search('"info": "You are already logged in"')).to.equal(-1);
              done();
            });
        });
    });

    it('Should be able to login to more than one installation', function(done) {
      var agent = sa.agent();

      agent.post(oneUrl + '/login')
        .send({
          email : user1.email,
          password : user1.password
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);

          agent.post(twoUrl + '/login')
            .send({
              email : user2.email,
              password : user2.password
            })
            .end(function(err, res) {
              expect(err).to.be.equal(null);
              expect(res.status).to.be.equal(200);
              done();
            });

        });
    });

  });

  describe('Logout', function () {

    it('Should logout', function(done) {
      var agent = sa.agent();
      agent.post(oneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);
          agent.get(oneUrl + '/logout')
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.status).to.be.equal(200);
            expect(res.text.search('"success": "Signed off"')).to.not.equal(-1);
            done();
          })

        });
    });

  });

  describe('Reset', function () {

    describe('#resetShow', function () {

      it('Should GET /resetPassword with status code 200', function (doneTest) {
        sa.get(oneUrl + urlFor.reset.url())
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            return doneTest();
          });
      });

      it('Should redirect to / with status code 200 if already logged-in', function (doneTest) {
        var agent = sa.agent();

        agent.post(oneUrl + urlFor.login.url())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.get(oneUrl + urlFor.reset.url())
              .end(function (err, res) {
                expect(err).to.be.equal(null);
                expect(res.status).to.be.equal(200);
                expect(res.redirects.length).to.equal(1);
                expect(res.text.search('"info": "You are already logged in"')).to.not.equal(-1);

                return doneTest();
              });
          });
      });

    });

    describe('#resetCreate', function () {

      beforeEach(function () {
        return Promise.all([
          cont1.get('ResetPasswordToken').query().delete(),
          cont2.get('ResetPasswordToken').query().delete(),
        ]);
      });

      it('Should return 200 and create a token', function (doneTest) {
        sa.post(oneUrl + urlFor.reset.url())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            cont1.query('ResetPasswordToken')
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(oneUrl + urlFor.login.url())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.post(oneUrl + urlFor.reset.url())
              .send({
                email: user1.email
              })
              .end(function (err, res) {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(403);
                expect(res.body.message).to.exist;
                expect(res.body.message).to.equal('You are already logged in');

                return doneTest();
              });
          });
      });

      it('Should return 404 with unexistent email', function (doneTest) {
        sa.post(oneUrl + urlFor.reset.url())
          .send({
            email: 'unexistent@email.com'
          })
          .end(function (err, res) {
            expect(err).to.not.equal(null);
            expect(res.status).to.equal(404);
            expect(res.body.message).to.exist;
            expect(res.body.message).to.equal('Email not found');

            return doneTest();
          });
      });

    });

    describe('#resetUpdate', function () {

      beforeEach(function () {
        return Promise.all([
          cont1.get('ResetPasswordToken').query().delete(),
          cont2.get('ResetPasswordToken').query().delete(),
        ]);
      });

      it('Should return 200 and change password if provided valid token', function (doneTest) {
        sa.post(oneUrl + urlFor.reset.url())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            cont1.query('ResetPasswordToken')
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(oneUrl + urlFor.reset.url())
                    .send({
                      password: '12345678',
                      token: token.token
                    })
                    .end(function (err, res) {
                      expect(err).to.equal(null);
                      expect(res.status).to.equal(200);
                      expect(res.body.message).to.exist;
                      expect(res.body.message).to.equal('Password has been reset');

                      return resolve();
                    });
                });
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(oneUrl + urlFor.login.url())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.put(oneUrl + urlFor.reset.url())
              .send({})
              .end(function (err, res) {
                expect(err).to.not.equal(null);
                expect(res.status).to.equal(403);
                expect(res.body.message).to.exist;
                expect(res.body.message).to.equal('You are already logged in');

                return doneTest();
              });
          });
      });

      it('Should return 404 and a message with unexistent token', function (doneTest) {
        sa.post(oneUrl + urlFor.reset.url())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            cont1.query('ResetPasswordToken')
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(oneUrl + urlFor.reset.url())
                    .send({
                      password: '12345678',
                      token: 'invalid token'
                    })
                    .end(function (err, res) {
                      expect(err).to.not.equal(null);
                      expect(res.status).to.equal(404);
                      expect(res.body.message).to.exist;
                      expect(res.body.message).to.equal('Invalid token');

                      return resolve();
                    });
                });
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 404 and a message with expired token', function (doneTest) {
        sa.post(oneUrl + urlFor.reset.url())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            cont1.query('ResetPasswordToken')
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                token.expiresAt = moment().subtract(1, 'days');

                return cont1.update(token);
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(oneUrl + urlFor.reset.url())
                    .send({
                      password: '12345678',
                      token: token.token
                    })
                    .end(function (err, res) {
                      expect(err).to.not.equal(null);
                      expect(res.status).to.equal(404);
                      expect(res.body.message).to.exist;
                      expect(res.body.message).to.equal('Invalid token');

                      return resolve();
                    });
                });
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

    });

  });

});
