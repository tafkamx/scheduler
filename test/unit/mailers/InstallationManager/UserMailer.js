var path = require('path');
var UserMailer = require(path.join(process.cwd(), 'mailers', 'InstallationManager', 'UserMailer.js'));

var user = new InstallationManager.User({
  email : 'sergio@delagarza.io',
  password : '12345678'
});

describe('InstallationManager.UserMailer', function() {
  before(function(done) {
    user.save().then(function(res) {
      done();
    });
  });

  it('Should success sendActivationLink', function(done) {
    return UserMailer.sendActivationLink(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return done();
    });
  });

  it('Should success sendChangedPasswordNotification', function (doneTest) {
    return UserMailer.sendChangedPasswordNotification(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

  it('Should success sendChangedEmailEmails', function (doneTest) {
    return UserMailer.sendChangedEmailEmails(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

  it('Should success sendResetPassword', function (doneTest) {
    var token = {
      token: '123456789'
    };

    return UserMailer.sendResetPassword(user, token).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

  after(function(done) {
    return Promise.all([
      InstallationManager.User.query().delete()
    ])
      .then(function () {
        return done();
      })
      .catch(done)
  });
});
