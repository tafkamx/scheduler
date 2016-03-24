Sc.ACL.addRole(new Sc.Role('Visitor'));

Sc.ACL.addResource(new Sc.Resource('installation-manager'));

Sc.ACL.allow('Visitor', [
  'index',
  'show',
  'new',
  'create',
  'edit',
  'update',
  'destroy'
], 'installation-manager', function(acl, req) {
  return Promise.resolve(false);
});
