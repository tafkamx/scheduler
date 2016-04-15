'use strict';

var path = require('path');
var getCurrentInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'get-current-installation-url.js'));

var port = CONFIG[CONFIG.environment].port;

describe('get-current-installation-url', function () {

  it('Should not skip port by default (in test)', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getCurrentInstallationUrl(req);

    expect(result).to.equal('http://default.installation-one.test-installation.com:' + port);
  });

  it('Should not skip port if explicitly told not to (in test)', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getCurrentInstallationUrl(req, false);

    expect(result).to.equal('http://default.installation-one.test-installation.com:' + port);
  });

  it('Should skip port if told to do so', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getCurrentInstallationUrl(req, true);

    expect(result).to.equal('http://default.installation-one.test-installation.com');
  });

});
