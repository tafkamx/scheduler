var psl = require('psl');
var Knex = require('knex');
var path = require('path');

var parser = function(req, res, next) {
  var host = req.headers.host;

  if (host === 'localhost:3000' || host === CONFIG[CONFIG.environment].defaultDomainName) {
    return next();
  }

  // remove port
  host = host.replace(/\:\d+$/, '');

  var d = psl.parse(host);

  var subdomain = d.subdomain.split('.');

  var query = InstallationManager.Installation.query();

  if (d.domain === CONFIG[CONFIG.environment].defaultDomainName.replace(/\:\d+$/, '')) {
    var installationName;

    if (subdomain.length === 2) {
      installationName = subdomain[1];
    } else {
      installationName = subdomain[0];
    }

    query.whereRaw('lower(name) = ?', [installationName.toLowerCase()]);
  } else {
    query.whereRaw('lower(domain) = ?', [d.domainName.toLowerCase()]);
  }

  query.then(function(installation) {
    if (installation.length === 0) {
      return next(new NotFoundError('Installation Not Found.'))
    }

    installation = installation[0];

    var knexConfig = require(path.join(process.cwd(), 'knexfile.js'));

    knexConfig[CONFIG.environment].connection.database = installation.name.toLowerCase() + '-' + CONFIG.environment;

    var knex = new Knex(knexConfig[CONFIG.environment]);

    req.knex = knex;
    req.installationId = installation.id;

    if (subdomain.lenght === 2) {
      req.branch = subdomain[0];
    } else {
      req.branch = 'default';
    }

    next();
  }).catch(next);
}

module.exports = parser;
