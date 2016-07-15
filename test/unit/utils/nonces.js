const expect = require('chai').expect;
const onepath = require('onepath');

const nonces = onepath.require('./lib/utils/nonces');

const SAMPLE_NONCE_STORE = {
  reason: '', setTime: 0, duration: 0, data: null,
  installationName: '', branchName: ''  
};

describe('./test/unit/utils/nonces.js', function() {
  beforeEach(function() {
    global.nonces = {};
  });
  
  it('nonce gc should be running', function() {
    expect(!!global.isNonceRunning).to.be.true;
  })

  describe('#createNonce', function() {
    it('Should generate a string that is 15 characters + a timestamp (13 digits)', function() {
      const nonce = nonces.createNonce();
      expect(/^[a-z0-9]{15}[0-9]{13}$/.test(nonce)).to.equal(true);
      var store = global.nonces[nonce];
      expect(store).to.exist;
      expect(store).to.be.an('object').and.not.be.empty;
      expect(store).to.have.property('reason').and.be.a('string');
      expect(store).to.have.property('setTime').and.be.a('number');
      expect(store).to.have.property('duration').and.be.a('number');
      expect(store).to.have.property('data')
      expect(store).to.have.property('installationName');
      expect(store).to.have.property('branchName');
    })
    it('Must be able to store reason, duration, data (anything), installationName and branchName', function() {
      const reason = (Math.random()*0xFFFFF).toString(22);
      const duration = ~~(Math.random()*0xFFFFF);
      const data = (Math.random()*0xFFFFF).toString(22);
      const installationName = (Math.random()*0xFFFFF).toString(22);
      const branchName = (Math.random()*0xFFFFF).toString(22);
      var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
      expect(/^[a-z0-9]{15}[0-9]{13}$/.test(nonce)).to.equal(true);
      var store = global.nonces[nonce];
      expect(store).to.exist;
      expect(store).to.be.an('object').and.not.be.empty;
      expect(store).to.have.property('reason').and.be.to.equal(reason);
      expect(store).to.have.property('setTime');
      expect(store).to.have.property('duration').and.be.to.equal(duration);
      expect(store).to.have.property('data').and.be.to.equal(data);
      expect(store).to.have.property('installationName').and.be.to.equal(installationName);
      expect(store).to.have.property('branchName').and.be.to.equal(branchName);
    })
  });

  describe('#validateNonce', function() {
    it('Should return false when nonce is invalid', function() {
      const reason = (Math.random()*0xFFFFF).toString(22);
      const duration = ~~(Math.random()*0xFFFFF);
      const data = (Math.random()*0xFFFFF).toString(22);
      const installationName = (Math.random()*0xFFFFF).toString(22);
      const branchName = (Math.random()*0xFFFFF).toString(22);
      var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
      var storedObject = global.nonces[nonce];
      var store = nonces.validateNonce(nonce + 'INVALIDNESS', reason);
      expect(store).to.equal(false);
    })
    it('Should return false when reason is invalid', function() {
      const reason = (Math.random()*0xFFFFF).toString(22);
      const duration = ~~(Math.random()*0xFFFFF);
      const data = (Math.random()*0xFFFFF).toString(22);
      const installationName = (Math.random()*0xFFFFF).toString(22);
      const branchName = (Math.random()*0xFFFFF).toString(22);
      var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
      var storedObject = global.nonces[nonce];
      var store = nonces.validateNonce(nonce, 'SOME_INVALID_REASON');
      expect(store).to.equal(false);
    })
    it('Should return false when nonce has expired', function(done) {
      const reason = (Math.random()*0xFFFFF).toString(22);
      const duration = 100;
      const data = (Math.random()*0xFFFFF).toString(22);
      const installationName = (Math.random()*0xFFFFF).toString(22);
      const branchName = (Math.random()*0xFFFFF).toString(22);
      var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
      var storedObject = global.nonces[nonce];
      setTimeout(function(){
        var store = nonces.validateNonce(nonce, reason);
        expect(store).to.equal(false);
        done();
      }, duration + 50);
    })
    it('Should return the `data` value when valid', function() {
      const reason = (Math.random()*0xFFFFF).toString(22);
      const duration = ~~(Math.random()*0xFFFFF);
      const data = (Math.random()*0xFFFFF).toString(22);
      const installationName = (Math.random()*0xFFFFF).toString(22);
      const branchName = (Math.random()*0xFFFFF).toString(22);
      var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
      var storedObject = global.nonces[nonce];
      var store = nonces.validateNonce(nonce, reason);
      expect(store).to.equal(storedObject.data);
    })
  })

  describe('#gc', function(done) {
    it('Should erase all expired nonces from global object (and leave 1 long duration nonce)', function(done) {
      const duration = 1 + ~~(Math.random() * 100);
      function createNonce(duration) {
        const reason = (Math.random()*0xFFFFF).toString(22);
        const data = (Math.random()*0xFFFFF).toString(22);
        const installationName = (Math.random()*0xFFFFF).toString(22);
        const branchName = (Math.random()*0xFFFFF).toString(22);
        var nonce = nonces.createNonce(reason, duration, data, installationName, branchName);
        return nonce;
      }

      var iterationCount = ~~(Math.random() * 0xFF)
      var noncesCreated = []
      for (var i = 0; i < iterationCount; i++) {
        noncesCreated.push(createNonce(duration));
      }

      noncesCreated.forEach(function(nonce) {
        expect(Object.keys(global.nonces).indexOf(nonce)).to.not.equal(-1);
      });

      var longDurationNonce = createNonce(1000 * 60 * 10);

      setTimeout(function(){
        nonces.gc();
        expect(Object.keys(global.nonces).length).to.equal(1);
        expect(global.nonces[longDurationNonce]).to.exist;
        done();
      }, duration + 50);
    })
  })
});
