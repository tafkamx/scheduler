var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;
var url = container.props.url;

describe('Accounts Controller', function() {

  var account1, account2, account3;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    container.create('Account', {
      branchName: 'default',
      type: 'teacher'
    }).then(function() {
      done();
    }).catch(done);
  });

  after(function(done) {
    container.get('Account').query().delete()
    .then(function() {
      done();
    }).catch(done);
  });
  /* === END Before/After Actions === */

  /* === Expect statement === */
  it('Should render /Accounts', function(done) {
    agent.get(url + '/Accounts').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.status).to.equal(200);
    });
  });

});
