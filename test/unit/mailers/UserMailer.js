var path = require('path');
var UserMailer = require(path.join(process.cwd(), 'mailers', 'UserMailer'));

var userMailer = new UserMailer({
  installationUrl: 'something',
});

var user = new User({
  email : 'sergio@delagarza.io',
  password : '12345678',
});

describe('UserMailer', function() {

  it('Should success sendActivationLink', function(done) {
    return userMailer.sendActivationLink(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return done();
    });
  });

  it('Should success sendChangedPasswordNotification', function (doneTest) {
    return userMailer.sendChangedPasswordNotification(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

  it('Should success sendChangedEmailEmails', function (doneTest) {
    return userMailer.sendChangedEmailEmails(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

  it('Should success sendResetPassword', function (doneTest) {
    var token = {
      token: '123456789'
    };

    return userMailer.sendResetPassword(user, token).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return doneTest();
    });
  });

});
