Sc.ACL.addRole(new Sc.Role('Franchisor'), 'Franchisee');

Sc.ACL.allow('Franchisor', [
  'index',
  'show',
  'new',
  'create',
  'edit',
  'update',
  'destroy'
], 'branches', function (acl, req) {
  return Promise.resolve(true);
});