var path = require('path');
var UserMailer = require(path.join(process.cwd(), 'mailers', 'UserMailer'));

var user = new InstallationManager.User({
  email : 'sergio@delagarza.io',
  password : '12345678'
});

describe('UserMailer', function() {
  before(function(done) {
    user.save().then(function(res) {
      done();
    });
  });

  it('Should sendActivationLink', function(done) {
    return UserMailer.sendActivationLink(user).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(user.email);
      return done();
    });
  });

  after(function(done) {
    InstallationManager.User.query().delete().then(function() {
      done();
    });
  });
});
