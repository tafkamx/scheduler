var path = require('path');
var nonces = require(path.join(process.cwd(), 'lib', 'utils', 'nonces.js'));

describe('Nonces', function() {
  var req = { user: { info: { test: 'test' } } };
  var user1, user2;

  before(function(done) {
    done();
  });

  describe('Generation', function() {
    it('Should generate a string that is 15 characters + a timestamp', function(done) {
      var user1 = nonces.getUserNonce({}, 'tests', 1); // Test for non-logged-in User
      var user2 = nonces.getUserNonce(req, 'tests', 1); // Test for regular User
      nonces.getUserNonce({}, 'test', 1);

      var timeLen = Date.now().toString().length; // Future-proof timestamp comparison
      expect(user1).to.have.length(15 + timeLen);
      done();
    });
  });

/**
  describe('Verification', function() {
  });

  describe('Memory Clearing', function() {
  });
*/
  after(function(done) {
    clearInterval(global.isNonceRunning);
    done();
  });
});
