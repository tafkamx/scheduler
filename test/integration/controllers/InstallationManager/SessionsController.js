var expect = require('chai').expect;
var agent = sa.agent();

var adminUser = new InstallationManager.User({
  email : 'test@example.com',
  password : '12345678'
});

describe('InstallationManager.SessionsController', function() {
  before(function(done) {
    adminUser.save().then(function(res) {
      done();
    })
  });

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

  after(function(done) {
    InstallationManager.User.query().delete().then(function() {
      done();
    });
  });
});
