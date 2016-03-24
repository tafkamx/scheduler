Sc.ACL.addRole(new Sc.Role('Admin'), 'Visitor');

Sc.ACL.allow('Admin', [
  'index',
  'show',
  'new',
  'create',
  'edit',
  'update',
  'destroy'
], 'installation-manager', function (acl, req) {
  return Promise.resolve(true);
});
