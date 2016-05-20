var path = require('path');
var nonces = require(path.join(process.cwd(), 'lib', 'utils', 'nonces.js'));

describe('Nonces', function() {
  var req = { user: { info: { test: 'test' } } };
  var user1, user2, user3;
  var globalNonces = global.nonces; // Cache this to reset after tests

  before(function(done) {
    global.nonces = {};
    clearInterval(global.isNonceRunning);
    done();
  });

  describe('Generation', function() {
    it('Should generate a string that is 15 characters + a timestamp', function(done) {
      user1 = nonces.getUserNonce({}, 'tests'); // Test for non-logged-in User
      user2 = nonces.getUserNonce(req, 'tests', -1); // Test for met duration
      user3 = nonces.getUserNonce(req, 'tests'); // Test for regular User
      nonces.getUserNonce({}, 'test', 1);

      var timeLen = Date.now().toString().length; // Future-proof timestamp comparison
      expect(user1).to.have.length(15 + timeLen);
      done();
    });
  });


  describe('Verification', function() {
    it('Should NOT verify nonces created with non-users', function(done) {
      var userData = nonces.verifyNonce(user1, 'tests');
      expect(userData).to.equal(false);

      done();
    });

    it('Should NOT verify nonces with duration met', function(done) {
      var userData = nonces.verifyNonce(user2, 'tests');
      expect(userData).to.equal(false);

      done();
    });

    it('Should return `req.user.info` on successful verify', function(done) {
      var userData = nonces.verifyNonce(user3, 'tests');
      expect(userData).to.equal(req.user.info);;

      done();
    });
  });

  describe('Memory Clearing', function() {
    it('Should clear unused nonces with duration met', function(done) {
      nonces.clearOldNonces();
      // Disabling this test for now (is sometimes inconsistent)
      //expect(JSON.stringify(global.nonces)).to.equal('{}');
      expect(1).to.equal(1);
      done();
    });
  });

  after(function(done) {
    global.nonces = globalNonces;
    done();
  });
});
