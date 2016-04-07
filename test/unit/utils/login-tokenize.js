var path = require('path');
var loginTokenize = require(path.join(process.cwd(), 'lib', 'utils', 'login-tokenize.js'));

describe('Guest Login Tokenizer', function() {
  var token1, token2;
  var req = { user: { info: { test: 'test' } } };

  describe('generateInstallToken', function() {

    it('Should generate a string', function(done) {
      token1 = loginTokenize.generateInstallToken(req, 'some-test-install');
      token2 = loginTokenize.generateInstallToken(req, 'another-test-install');
      expect(token1).to.be.a('string');

      done();
    });

  });

  describe('attemptVerifyToken', function() {

    it('Should return `req.user.info` on successful verify', function(done) {
      var userData = loginTokenize.attemptVerifyToken(token1, 'some-test-install');
      expect(userData).to.equal(req.user.info);

      done();
    });

    it('Should NOT verify tokens already verified', function(done) {
      var userData = loginTokenize.attemptVerifyToken(token1, 'some-test-install');
      expect(userData).to.equal(false);

      done();
    });

    it('Should NOT verify modified tokens', function(done) {
      var userData = loginTokenize.attemptVerifyToken('modification' + token2, 'another-test-install');
      expect(userData).to.equal(false);

      done();
    });

  });
});
