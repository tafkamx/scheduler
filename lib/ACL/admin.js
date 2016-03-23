Sc.ACL.addRole(new Sc.Role('Admin'), 'Visitor');

Sc.ACL.allow('Admin', [
  'index',
  'new',
  'show',
  'edit',
  'update',
  'destroy'
], 'installation-admin', function (acl, req) {
  return Promise.resolve(true);
});
