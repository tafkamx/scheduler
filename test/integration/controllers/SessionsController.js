var expect = require('chai').expect;
var path = require('path');
var moment = require('moment');

var Knex,
  user1,
  user2,
  knexConfig,
  knexOneConfig,
  knexTwoConfig,
  knex1,
  knex2;

var _ = require('lodash');
var Promise = require('bluebird');

var installationOne = 'installation-one';
var installationTwo = 'installation-two';
var websiteUrl = CONFIG[CONFIG.environment].defaultDomainName;

var installationOneUrl = 'http://default.' + installationOne + '.' + websiteUrl;
var installationTwoUrl = 'http://default.' + installationTwo + '.' + websiteUrl;

var agent1 = sa.agent();
var agent2 = sa.agent();

var urlFor = CONFIG.router.helpers;

var mailers = { user: new UserMailer({ installationUrl: 'something' }) };

describe('SessionsController', function() {
  before(function(done) {
    Knex = require('knex');

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexOneConfig = _.clone(knexConfig, true);
    knexTwoConfig = _.clone(knexConfig, true);

    knexOneConfig[CONFIG.environment].connection.database = installationOne.toLowerCase() + '-' + CONFIG.environment;

    knexTwoConfig[CONFIG.environment].connection.database = installationTwo.toLowerCase() + '-' + CONFIG.environment;

    knex1 = new Knex(knexOneConfig[CONFIG.environment]);
    knex2 = new Knex(knexTwoConfig[CONFIG.environment]);

    user1 = new User({
      email : 'installation.one.user@example.com',
      password : '12345678',
      role: 'franchisor',
      mailers: mailers,
    });

    user2 = new User({
      email : 'installation.two.user@example.com',
      password : '12345678',
      role: 'franchisor',
      mailers: mailers,
    });

    Promise.all([
      user1.save(knex1).then(function(res) {
        return res;
      }),
      user2.save(knex2).then(function(res) {
        return user2
      }).then(function(res) {
        res.activate().save(knex2).then(function(res) {
          return res;
        });
      }),

    ]).then(function(res) {
      done();
    }).catch(done);
  });

  describe('Login', function () {

    it('Should fail login because the account has not been activated', function(done) {
      sa.agent().post(installationOneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('User not activated')).to.not.equal(-1);
          done();
        });
    });

    it('Should login and activate with the users token', function(done) {
      sa.agent().get(installationOneUrl + '/login?email=false&token=' + user1.token)
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);
        done();
      })

    });

    it('Should login with the email/password', function(done) {
      sa.agent().post(installationOneUrl + '/login')
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
      agent.post(installationOneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);

          agent.get(installationOneUrl + '/login')
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

      agent.post(installationOneUrl + '/login')
        .send({
          email : user1.email,
          password : user1.password
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);

          agent.get(installationTwoUrl + '/login')
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

      agent.post(installationOneUrl + '/login')
        .send({
          email : user1.email,
          password : user1.password
        })
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);

          agent.post(installationTwoUrl + '/login')
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
      agent.post(installationOneUrl + '/login')
        .send({ email: user1.email, password: user1.password})
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          expect(res.text.search('"success": "Welcome to PatOS Installation"')).to.not.equal(-1);
          agent.get(installationOneUrl + '/logout')
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
        sa.get(installationOneUrl + urlFor.reset())
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            return doneTest();
          });
      });

      it('Should redirect to / with status code 200 if already logged-in', function (doneTest) {
        var agent = sa.agent();

        agent.post(installationOneUrl + urlFor.login())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.get(installationOneUrl + urlFor.reset())
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

      it('Should return 200 and create a token', function (doneTest) {
        sa.post(installationOneUrl + urlFor.reset())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            ResetPasswordToken.query(knex1)
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                return ResetPasswordToken.query(knex1).delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(installationOneUrl + urlFor.login())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.post(installationOneUrl + urlFor.reset())
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
        sa.post(installationOneUrl + urlFor.reset())
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

      it('Should return 200 and change password if provided valid token', function (doneTest) {
        sa.post(installationOneUrl + urlFor.reset())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            ResetPasswordToken.query(knex1)
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(installationOneUrl + urlFor.reset())
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
                return ResetPasswordToken.query(knex1).delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(installationOneUrl + urlFor.login())
          .send({
            email: user1.email,
            password: user1.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.put(installationOneUrl + urlFor.reset())
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
        sa.post(installationOneUrl + urlFor.reset())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            ResetPasswordToken.query(knex1)
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(installationOneUrl + urlFor.reset())
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
                return ResetPasswordToken.query(knex1).delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 404 and a message with expired token', function (doneTest) {
        sa.post(installationOneUrl + urlFor.reset())
          .send({
            email: user1.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            ResetPasswordToken.query(knex1)
              .where('user_id', user1.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                token.expiresAt = moment().subtract(1, 'days');

                return token.save(knex1);
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(installationOneUrl + urlFor.reset())
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
                return ResetPasswordToken.query(knex1).delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

    });

  });

  after(function(done) {
    Promise.all([
      User.query(knex1).delete(),
      User.query(knex2).delete()
    ]).then(function() {
      done();
    });
  });
});
