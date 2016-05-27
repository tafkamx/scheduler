var path = require('path');
var bitmasks = require(path.join(process.cwd(), 'lib', 'utils', 'availability-bitmasks.js'));

describe('Availability Bitmasks Utilities', function() {
  it('Should generate an array of bit values related to the hours within a day', function(done) {
    expect(bitmasks.bitsByHour).to.be.an('array');
    expect(bitmasks.bitsByHour).to.have.lengthOf(24);
    done();
  });

  it('Should provide a method to get bitmask related to hour', function(done) {
    expect(bitmasks.getBitmask(0, 1, 3)).to.equal(2 + 4 + 16);
    done();
  });

  it('Should provide a method to compare bitmasks', function(done) {
    var b1 = bitmasks.getBitmask(11, 13);
    var b2 = bitmasks.getBitmask(11, 12, 13);
    var b3 = bitmasks.getBitmask(14);

    expect(b1).to.be.a('number');
    expect(bitmasks.isIn(b1, b2)).to.equal(true);
    expect(bitmasks.isIn(b1, b3)).to.equal(false);
    done();
  });
});
