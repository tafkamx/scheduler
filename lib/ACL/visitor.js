Sc.ACL.addRole(new Sc.Role('Visitor'));

Sc.ACL.addResource(new Sc.Resource('branches'));

Sc.ACL.allow('Visitor', [
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
