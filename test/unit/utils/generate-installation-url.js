'use strict';

var path = require('path');
var generateInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'generate-installation-url.js'));

var port = CONFIG[CONFIG.environment].port;
var defaultDomain = CONFIG[CONFIG.environment].defaultDomainName;

describe('generate-installation-url', function () {

  it('Should generate a proper URL if given all the arguments', function () {
    var i = {
      branch: 'gdl',
      installation: 'school',
      domain: 'greduan.com',
    };

    var result = generateInstallationUrl(i.branch, i.installation, i.domain);

    expect(result).to.equal('http://gdl.school.greduan.com:' + port);
  });

  it('Should use defaultDomainName if given no domain', function () {
    var i = {
      branch: 'gdl',
      installation: 'school',
    };

    var result = generateInstallationUrl(i.branch, i.installation);

    expect(result).to.equal('http://gdl.school.' + defaultDomain);
  });

});
