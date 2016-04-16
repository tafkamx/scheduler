'use strict';

var path = require('path');
var _ = require('lodash');

var changeBranchInInstallationUrl = require(path.join(process.cwd(), 'lib', 'utils', 'change-branch-in-installation-url.js'));

var urlPort = 'http://default.installation-one.test-installation.com:3001',
  url = 'http://default.installation-one.test-installation.com';

var noBranchUrlPort = 'http://installation-one.test-installation.com:3001',
  noBranchUrl = 'http://installation-one.test-installation.com';

describe('change-branch-in-installation-url', function () {

  it('Should change branch name in URL with port', function () {
    var result = changeBranchInInstallationUrl(urlPort, 'something');

    expect(_.isString(result)).to.equal(true);
    expect(result).to.equal('http://something.installation-one.test-installation.com:3001');
  });

  it('Should change branch name in URL without port', function () {
    var result = changeBranchInInstallationUrl(url, 'something');

    expect(_.isString(result)).to.equal(true);
    expect(result).to.equal('http://something.installation-one.test-installation.com');
  });

  it('Should add a branch name to URL with port', function () {
    var result = changeBranchInInstallationUrl(noBranchUrlPort, 'something');

    expect(_.isString(result)).to.equal(true);
    expect(result).to.equal('http://something.installation-one.test-installation.com:3001');
  });

  it('Should add a branch name to URL without port', function () {
    var result = changeBranchInInstallationUrl(noBranchUrl, 'something');

    expect(_.isString(result)).to.equal(true);
    expect(result).to.equal('http://something.installation-one.test-installation.com');
  });

  it('Should throw error on invalid URL', function () {
    var urlPort = 'http://default.installation-one.extra.test-installation.com:3001';

    var fn = function () {
      changeBranchInInstallationUrl(urlPort, 'something');
    };

    expect(fn).to.throw;
  });

});
