var path = require('path');

describe('Branch Model', function() {
  var knex;

  before(function() {
    var installation = 'installation-one';
    var Knex = require('knex');
    var knexConfig;

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);
  });

  it('Should create a branch', function(done) {
    var branch = new Branch({
      name : 'toronto'
    });

    branch.save(knex).then(function(res) {
      expect(res.length).to.be.equal(1);
      expect(res[0]).to.be.equal(branch.id);
      done();
    });
  });

  it('Should fail if name is invalid', function(done) {
    var branch = new Branch({
      name : 'Thunder Bay'
    });

    branch.save(knex).catch(function(err) {
      expect(err).is.an.instanceof(Error);
      expect(err.message).to.be.equal('1 invalid values');
      expect(err.errors.name.message).to.be.equal('The name must only contain alpha-numeric characters and dashes.')
      done();
    });
  });

  it('Should fail if name already exists', function(done) {
    var branch = new Branch({
      name : 'toronto'
    });

    branch.save(knex).catch(function(err) {
      expect(err).is.an.instanceof(Error);
      expect(err.message).to.be.equal('1 invalid values');
      expect(err.errors.name.message).to.be.equal('The name already exists.')
      done();
    });
  });

  after(function(done) {
    knex.destroy().then(done);
  });
});
