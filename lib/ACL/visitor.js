Sc.ACL.addRole(new Sc.Role('Visitor'));

Sc.ACL.addResource(new Sc.Resource('installation-admin'));

Sc.ACL.allow('Visitor', [
  'index',
  'new',
  'show',
  'edit',
  'update',
  'destroy'
], 'installation-admin', function(acl, req) {
  return Promise.resolve(false);
});
