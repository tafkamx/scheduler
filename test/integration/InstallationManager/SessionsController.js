var expect = require('chai').expect;
var moment = require('moment');

var adminUser = new InstallationManager.User({
  email: 'test@example.com',
  password: '12345678',
});

var urlFor = CONFIG.router.helpers;

describe('InstallationManager.SessionsController', function() {

  before(function (done) {
    adminUser.save()
      .then(function () {
        done();
      })
      .catch(done);
  });

  after(function () {
    return Promise.all([
      InstallationManager.Installation.query()
        .where('name', 'not in', ['installation-inte', 'installation-unit'])
        .delete(),
      InstallationManager.User.query().delete(),
    ]);
  });

  describe('Login', function () {

    it('Should fail login because the account has not been activated', function(done) {
      sa.agent().post(baseURL + '/InstallationManager/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        })
        .end(function(err, res) {
          expect(err).to.equal(null);
          expect(res.text.search('User not activated')).to.not.equal(-1);
          done();
        });
    });

    it('Should login and activate with the users token', function(done) {
      sa.agent().get(baseURL + '/InstallationManager/login?email=false&token=' + adminUser.token)
        .end(function(err, res) {
          expect(err).to.equal(null);
          expect(res.text.search('"success": "PatOS Installation Admin"')).to.not.equal(-1);
          done();
        })
    });

    it('Should login with the email/password', function(done) {
      sa.agent().post(baseURL + '/InstallationManager/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        })
        .end(function(err, res) {
          expect(err).to.equal(null);
          expect(res.text.search('"success": "PatOS Installation Admin"')).to.not.equal(-1);
          done();
        });
    });

    it('Should not let a logged in user login', function(done) {
      var agent = sa.agent();

      agent.post(baseURL + '/InstallationManager/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        })
        .end(function(err, res) {
          expect(err).to.equal(null);
          expect(res.text.search('"success": "PatOS Installation Admin"')).to.not.equal(-1);

          agent.get(baseURL + '/InstallationManager/login')
            .end(function(err, res) {
              expect(err).to.equal(null);
              expect(res.text.search('"info": "You are already logged in"')).to.not.equal(-1);
              done();
            });
        });
    });

  });

  describe('Logout', function () {

    it('Should logout', function(done) {
      var agent = sa.agent();
      agent.post(baseURL + '/InstallationManager/login')
        .send({
          email: adminUser.email,
          password: adminUser.password
        })
        .end(function(err, res) {
          expect(err).to.equal(null);
          expect(res.text.search('"success": "PatOS Installation Admin"')).to.not.equal(-1);

          agent.get(baseURL + '/InstallationManager/logout')
          .end(function(err, res) {
            expect(err).to.equal(null);
            expect(res.text.search('"success": "Signed off"')).to.not.equal(-1);
            done();
          });
        });
    });

  });

  describe('Reset', function () {

    describe('#resetShow', function () {

      it('Should GET /resetPassword with status code 200', function (doneTest) {
        sa.get(baseURL + urlFor.InstallationManager.reset.url())
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            return doneTest();
          });
      });

      it('Should redirect to / with status code 200 if already logged-in', function (doneTest) {
        var agent = sa.agent();

        agent.post(baseURL + urlFor.InstallationManager.login.url())
          .send({
            email: adminUser.email,
            password: adminUser.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.get(baseURL + urlFor.InstallationManager.reset.url())
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
        sa.post(baseURL + urlFor.InstallationManager.reset.url())
          .send({
            email: adminUser.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            InstallationManager.ResetPasswordToken.query()
              .where('user_id', adminUser.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                return InstallationManager.ResetPasswordToken.query().delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(baseURL + urlFor.InstallationManager.login.url())
          .send({
            email: adminUser.email,
            password: adminUser.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.post(baseURL + urlFor.InstallationManager.reset.url())
              .send({
                email: adminUser.email
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
        sa.post(baseURL + urlFor.InstallationManager.reset.url())
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
        sa.post(baseURL + urlFor.InstallationManager.reset.url())
          .send({
            email: adminUser.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            InstallationManager.ResetPasswordToken.query()
              .where('user_id', adminUser.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(baseURL + urlFor.InstallationManager.reset.url())
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
                return InstallationManager.ResetPasswordToken.query().delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 403 and a message when already logged in', function (doneTest) {
        var agent = sa.agent();

        agent.post(baseURL + urlFor.InstallationManager.login.url())
          .send({
            email: adminUser.email,
            password: adminUser.password
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            agent.put(baseURL + urlFor.InstallationManager.reset.url())
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
        sa.post(baseURL + urlFor.InstallationManager.reset.url())
          .send({
            email: adminUser.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            InstallationManager.ResetPasswordToken.query()
              .where('user_id', adminUser.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(baseURL + urlFor.InstallationManager.reset.url())
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
                return InstallationManager.ResetPasswordToken.query().delete();
              })
              .then(function () {
                return doneTest();
              })
              .catch(doneTest);
          });
      });

      it('Should return 404 and a message with expired token', function (doneTest) {
        sa.post(baseURL + urlFor.InstallationManager.reset.url())
          .send({
            email: adminUser.email
          })
          .end(function (err, res) {
            expect(err).to.equal(null);
            expect(res.status).to.equal(200);

            var token;

            InstallationManager.ResetPasswordToken.query()
              .where('user_id', adminUser.id)
              .then(function (result) {
                expect(result.length).to.equal(1);

                token = result[0];
              })
              .then(function () {
                token.expiresAt = moment().subtract(1, 'days');

                return token.save();
              })
              .then(function () {
                return new Promise(function (resolve, reject) {
                  sa.put(baseURL + urlFor.InstallationManager.reset.url())
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
                return InstallationManager.ResetPasswordToken.query().delete();
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
