Sc.ACL.addRole(new Sc.Role('User'), 'Visitor');

Sc.ACL.allow('User', [
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
