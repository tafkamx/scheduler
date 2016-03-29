Sc.ACL.addRole(new Sc.Role('Admin'), 'Visitor');

Sc.ACL.allow('Admin', [
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
