function isFalse(acl, req) {
  return false;
}

function isTrue(acl, req) {
  return true;
}

module.exports = {
  Visitor: [true, isFalse],
  Franchisor: [true, isTrue],
};
