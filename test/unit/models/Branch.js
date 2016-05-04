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

  describe('Relations', function() {
    it('Should load the settings relation', function(done) {
      var branch = new Branch({
        name : 'Vancouver'
      });

      var settings = new BranchSettings({
        language : 'en-CA',
        currency : 'CAD',
        timezone : 'America/Toronto'
      });

      branch.save(knex).then(function() {
        settings.branchId = branch.id;

        return settings.save(knex);
      }).then(function() {
        return Branch.query(knex).include('settings').where('id', branch.id)
        .then(function(res) {
          console.log(res)
          expect(res[0]).to.be.instanceof(Branch);
          expect(res[0].settings).to.be.instanceof(BranchSettings);
          expect(res[0].settings.id).to.be.equal(settings.id);
          done();
        });
      });
    });
  });

  after(function(done) {
    knex.destroy().then(done);
  });
});
