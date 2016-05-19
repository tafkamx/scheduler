var agent = sa.agent();

var container = INTE;
var path = require('path');
var urlFor = CONFIG.router.helpers;
var url = container.props.url;

describe('Accounts Controller', function() {

  var account1;

  /* === Before/After Actions === */
  before(function(done) {
    // Creating account1 (Teacher)
    container.create('Account', {
      branchName: 'default',
      type: 'teacher'
    }).then(function() {
      container.get('Account').query()
      .then(function(res) {
        account1 = res[0];
        done();
      }).catch(done);
    }).catch(done);
  });

  after(function(done) {
    container.get('Account').query().delete()
    .then(function() {
      done();
    }).catch(done);
  });
  /* === END Before/After Actions === */

  /* === Expect Statements === */
  it('Should render /Accounts', function(done) {
    agent.get(url + '/Accounts').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.status).to.equal(200);

      done();
    });
  });

  it('Should render /Accounts/show as 404 when no accountId', function(done) {
    agent.get(url + '/Accounts/show').set('Accept', 'text/html')
    .end(function(err, res) {
      expect(err).to.be.instanceof(Error);
      expect(res.status).to.equal(404);
      done();
    });
  });

  it('Should render /Accounts/accountId as JSON Object', function(done) {
    agent.get(url + '/Accounts/' + account1.id).set('Accept', 'application/json')
    .end(function(err, res) {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      done();
    });
  });

});
