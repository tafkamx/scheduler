var path = require('path');
var AdminUserMailer = require(path.join(process.cwd(), 'mailers', 'AdminUserMailer'));

var adminUser = new InstallationManager.AdminUser({
  email : 'sergio@delagarza.io',
  password : '12345678'
});

describe('AdminUserMailer', function() {
  before(function(done) {
    adminUser.save().then(function(res) {
      done();
    });
  });

  it('Should sendActivationLink', function(done) {
    return AdminUserMailer.sendActivationLink(adminUser).then(function(res) {
      expect(res.envelope.to[0]).to.be.equal(adminUser.email);
      return done();
    });
  });

  after(function(done) {
    InstallationManager.AdminUser.query().delete().then(function() {
      done();
    });
  });
});
