'use strict';

var path = require('path');

describe('BranchSettings Model', function() {
  var knex;

  before(function() {
    var installation = 'installation-one';
    var Knex = require('knex');
    var knexConfig;

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);
  });

  it('Should create a record', function(done) {
    var settings = new BranchSettings({
      language : 'en-CA',
      currency : 'CAD',
      timezone : 'America/Toronto'
    });

    var branch = new Branch({ name : 'ontario-please' });

    branch.save(knex).then(function(branch) {
      settings.branchId = branch[0];

      return settings.save(knex);
    }).then(function(res) {
      expect(res.length).to.be.equal(1);
      expect(res[0]).to.be.equal(settings.id);
      done();
    });
  });

  it('Should create a record from with the same InstallationSettings', function(done) {
    var settings = new BranchSettings();

    var branch = new Branch({ name : 'Abbotsford' });

    branch.save(knex).then(function(branch) {
      settings.branchId = branch[0];

      return settings.getInstallationSettings(knex).then(function() {
        return settings.save(knex)
      })
    }).then(function(res) {
      expect(res.length).to.be.equal(1);
      expect(res[0]).to.be.equal(settings.id);
      done();
    });
  });

  it('Should fail if language is invalid', function(done) {
    var settings = new BranchSettings({
      language : 'es-MX',
      currency : 'CAD',
      timezone : 'America/Toronto'
    });

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.errors.language.message).to.be.equal('Language is invalid.')
      done()
    });
  });

  it('Should fail if currency is invalid', function(done) {
    var settings = new BranchSettings({
      language : 'en-CA',
      currency : 'MXP',
      timezone : 'America/Toronto'
    });

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.errors.currency.message).to.be.equal('Currency is invalid.')
      done()
    });
  });

  it('Should fail if timezone is invalid', function(done) {
    var settings = new BranchSettings({
      language : 'en-CA',
      currency : 'CAD',
      timezone : 'Canada'
    });

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.errors.timezone.message).to.be.equal('Timezone is invalid.')
      done()
    });
  });

  it('Should fail if branchId is null', function(done) {
    var settings = new BranchSettings({
      language : 'en-CA',
      currency : 'CAD',
      timezone : 'America/Toronto'
    });

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.errors.branchId.message).to.be.equal('The branchId is required')
      done()
    });
  });

  after(function(done) {
    knex.destroy().then(done);
  });
})
