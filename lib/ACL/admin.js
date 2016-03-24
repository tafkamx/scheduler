Sc.ACL.addRole(new Sc.Role('Admin'), 'Visitor');

Sc.ACL.allow('Admin', [
  'index',
  'new',
  'show',
  'edit',
  'update',
  'destroy'
], 'installation-manager', function (acl, req) {
  return Promise.resolve(true);
});
