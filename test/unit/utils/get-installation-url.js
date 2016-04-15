'use strict';

var path = require('path');
var getInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'get-installation-url.js'));

var port = CONFIG[CONFIG.environment].port;

describe('get-installation-url', function () {

  it('Should not skip port by default (in test)', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getInstallationUrl(req);

    expect(result).to.equal('http://default.installation-one.test-installation.com:' + port);
  });

  it('Should not skip port if explicitly told not to (in test)', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getInstallationUrl(req, false);

    expect(result).to.equal('http://default.installation-one.test-installation.com:' + port);
  });

  it('Should skip port if told to do so', function () {
    var req = {
      protocol: 'http',
      hostname: 'default.installation-one.test-installation.com'
    };

    var result = getInstallationUrl(req, true);

    expect(result).to.equal('http://default.installation-one.test-installation.com');
  });

});
