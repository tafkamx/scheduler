var path = require('path'),
    glob = require('glob');

var util = require('./acl_helpers');

// main ACL setup
var roles = require(path.join(process.cwd(), 'lib', 'ACL', 'index.js'));

// expand arrays to Sc => GrandParent.Parent.Child
if (Array.isArray(roles)) {
  var seen = {};

  roles.forEach(function (role) {
    var lastRole;

    role.split('.').forEach(function (subRole) {
      if (!seen[subRole]) {
        Sc.ACL.addRole(new Sc.Role(subRole), lastRole || []);
        seen[subRole] = 1;
      }

      lastRole = [subRole];
    });
  });
}

var resources = {};

// load resources
glob.sync('lib/ACL/*/index.js').forEach(function (file) {
  resources[path.basename(path.dirname(file))] = require(path.join(process.cwd(), file));
});

var fixedResources = util.buildResources(resources);

// TODO: no more globals?
global.ACL = {
  resources: fixedResources,
  middlewares: util.buildMiddlewares(fixedResources)
};
