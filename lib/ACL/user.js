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
  return UserInfo.query(req.knex)
    .where('user_id', req.user.id)
    .then(function (result) {
      var isAllowed = false;

      if (result[0].role === 'admin') {
        isAllowed = true;
      }

      return Promise.resolve(isAllowed);
    });
});
