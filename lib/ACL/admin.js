Sc.ACL.addRole(new Sc.Role('Admin'), 'Visitor');

Sc.ACL.allow('Admin', 'index', 'installation-admin', function(acl, req) {
  return Promise.resolve(true);
});
