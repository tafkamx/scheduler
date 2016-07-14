const expect = require('chai').expect;
var onepath = require('onepath');
global.CONFIG = onepath.require('./config/config.js');
var loginTokenize = onepath.require('./lib/utils/login-tokenize');

const DEFAULT_BRANCH_NAME = 'default';
const SAMPLE_INSTALLATION_NAME = 'miau-academy';
const SAMPLE_BRANCH_NAME = 'miau';
const SAMPLE_USER = {
  id: 'miau',
  email: 'miau',
  email: 'miau',
};

describe('./test/unit/utils/login-tokenize.js', function() {
  beforeEach(function() {
    global.nonces = {};
  });
  describe('#createInstallationToken', function() {
    it('Should create a valid installation token tied with a valid nonce and grants object in memory', function() {
      var b64EncodedToken = loginTokenize.createInstallationToken(SAMPLE_USER, SAMPLE_INSTALLATION_NAME);
      var token = new Buffer(b64EncodedToken, 'base64').toString('utf8');
      var splitToken = token.split(loginTokenize.TOKEN_DELIMETER, 3);
      var hash = splitToken[0];
      var nonce = splitToken[1];
      var timestamp = +splitToken[2];
      // We will trust the nonce, since it has a test suite of its own
      // If it exists in `global.nonces`, token has been generated succesfully
      var store = global.nonces[nonce];
      expect(store).to.exist.and.be.a('object');
      expect(store.reason).to.equal(loginTokenize.NONCE_REASON);
      expect(store.installationName).to.equal(SAMPLE_INSTALLATION_NAME);
      expect(store.branchName).to.not.exist;
      expect(store.data).to.equal(SAMPLE_USER);
      expect(store.data.grants).to.be.a('object').and.not.empty;
      var grants = store.data.grants;
      expect(grants.access).to.equal('Installation');
      expect(grants.role).to.equal('Franchisor');
      expect(grants.installationName).to.equal(SAMPLE_INSTALLATION_NAME);
      expect(grants.expires).to.be.a('number'); // + or - . .and.equal(store.setTime + store.duration);
    });
  })
  describe('#createBranchToken', function() {
    it('Should create a valid branch token tied with a valid nonce and grants object in memory', function() {
      var b64EncodedToken = loginTokenize.createBranchToken(SAMPLE_USER, SAMPLE_INSTALLATION_NAME, SAMPLE_BRANCH_NAME);
      var token = new Buffer(b64EncodedToken, 'base64').toString('utf8');
      var splitToken = token.split(loginTokenize.TOKEN_DELIMETER, 3);
      var hash = splitToken[0];
      var nonce = splitToken[1];
      var timestamp = +splitToken[2];
      // We will trust the nonce, since it has a test suite of its own
      // If it exists in `global.nonces`, token has been generated succesfully
      var store = global.nonces[nonce];
      expect(store).to.exist.and.be.a('object')
      expect(store.reason).to.equal(loginTokenize.NONCE_REASON);
      expect(store.installationName).to.equal(SAMPLE_INSTALLATION_NAME);
      expect(store.branchName).to.equal(SAMPLE_BRANCH_NAME);
      expect(store.data).to.equal(SAMPLE_USER);
      expect(store.data.grants).to.be.a('object').and.not.empty;
      var grants = store.data.grants;
      expect(grants.access).to.equal('Branch');
      expect(grants.role).to.equal('Admin');
      expect(grants.installationName).to.equal(SAMPLE_INSTALLATION_NAME);
      expect(grants.branchName).to.equal(SAMPLE_BRANCH_NAME);
      // expect(grants.expires).to.be.a('number').and.equal(store.setTime + store.duration);
    });
  })
  describe('#validateToken', function() {
    it('Should return user object with grants when valid', function() {
      var b64EncodedToken = loginTokenize.createInstallationToken(SAMPLE_USER, SAMPLE_INSTALLATION_NAME);
      var grantee = loginTokenize.validateToken(b64EncodedToken, SAMPLE_INSTALLATION_NAME);
      expect(grantee).to.exist.and.be.a('object');
      expect(grantee).to.equal(SAMPLE_USER);
      var grants = grantee.grants;
      expect(grants.access).to.equal('Installation');
      expect(grants.role).to.equal('Franchisor');
      expect(grants.installationName).to.equal(SAMPLE_INSTALLATION_NAME);
      expect(grants.expires).to.be.a('number');
    });
  })
})
