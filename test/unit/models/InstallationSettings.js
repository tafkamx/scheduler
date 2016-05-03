var path = require('path');

describe('InstallationSettings Model', function () {
  var knex;
  var settingOptions;

  before(function() {
    var installation = 'installation-one';
    var Knex = require('knex');
    var knexConfig;

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);

    settingsOptions = {
      language : 'en-CA',
      currency : 'CAD',
      timezone : 'America/Toronto'
    }
  });

  it('Should save without errors', function(done) {

    var settings =  new InstallationSettings(settingsOptions);

    settings.save(knex).then(function(result) {
      expect(result.length).to.be.equal(1);
      expect(result[0]).to.be.equal(settings.id);
      done()
    });
  });

  it('Should fail if language is invalid', function(done) {
    var options = {
      language : 'es-MX',
      currency : 'CAD',
      timezone : 'America/Toronto'
    };

    var settings =  new InstallationSettings(options);

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('1 invalid values');
      expect(err.errors.language.message).to.be.equal('Language is invalid.')
      done()
    });
  });

  it('Should fail if currency is invalid', function(done) {
    var options = {
      language : 'en-CA',
      currency : 'MXP',
      timezone : 'America/Toronto'
    };

    var settings =  new InstallationSettings(options);

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('1 invalid values');
      expect(err.errors.currency.message).to.be.equal('Currency is invalid.')
      done()
    });
  });

  it('Should fail if timezone is invalid', function(done) {
    var options = {
      language : 'en-CA',
      currency : 'CAD',
      timezone : 'Canada'
    };

    var settings =  new InstallationSettings(options);

    settings.save(knex).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.be.equal('1 invalid values');
      expect(err.errors.timezone.message).to.be.equal('Timezone is invalid.')
      done()
    });
  });

  it('Should delete all records when creating a new one', function(done) {

    var settings =  new InstallationSettings(settingsOptions);

    var oldId;

    InstallationSettings.query(knex).then(function(result) {
      oldId = result[0].id;
      return;
    }).then(function() {
      return settings.save(knex)
    }).then(function() {
      expect(oldId).to.not.equal(settings.id)

      return InstallationSettings.query(knex)
    }).then(function(result) {
      expect(result[0].id).to.be.equal(settings.id)
      done();
    });
  });
});
