// this value may be taken through the route-mappings API
var ACL_ALL_REST = ['new', 'show', 'edit', 'index', 'create', 'update', 'destroy'];

// helper for promisifying all values
function toPromiseValue(test) {
  return function (acl, req) {
    if (Array.isArray(test)) {
      // perform checking from all tests
      var fixedTests = test.map(function (check) {
        // TODO: consider Promise.each() for sequence checks
        return check(acl, req);
      });

      return Promise.all(fixedTests).then(function (results) {
        // returns false if any value is false
        return !results.filter(function (value) {
          return !value;
        }).length;
      });
    }

    // single callback value or boolean
    return Promise.resolve(typeof test === 'function' ? test(req) : test);
  };
}

// helper for handler normalization
function fixHandler(value) {
  if (Array.isArray(value)) {
    if (value[0] === true || value[0] === false) {
      return ACL_ALL_REST.concat(toPromiseValue(value[0]));
    }

    value[value.length - 1] = toPromiseValue(value[value.length - 1]);

    return value;
  }

  return value;
}

// base helper to translate top-level to low-level
function setRules() {
  var ruleset = {};

  Array.prototype.slice.call(arguments).forEach(function (rule) {
    var fixedRule = fixHandler(rule);

    if (Array.isArray(fixedRule)) {
      var cb = fixedRule.pop();

      fixedRule.forEach(function (key) {
        ruleset[key] = cb;
      });
    } else {
      Object.keys(rule).forEach(function (key) {
        ruleset[key] = toPromiseValue(rule[key]);
      });
    }
  });

  return ruleset;
}

// normalize all given resources
function buildResources(resources) {
  var fixedResources = {};

  Object.keys(resources).forEach(function (resourceName) {
    var res = resources[resourceName];
    var fixedRes = fixedResources[resourceName] = {};

    Object.keys(res).forEach(function (role) {
      // reference for compiled ACL
      if (!fixedRes[role]) {
        fixedRes[role] = {
          actions: []
        };
      }

      // process rule definitions
      if (Array.isArray(res[role])) {
        // convert single to multiple rulesets
        if (!Array.isArray(res[role][0])) {
          res[role] = [res[role]];
        }

        // process each ruleset
        res[role].forEach(function (rules) {
          var fixedRules = setRules(rules);

          // apply compiled ACL for each resource-action
          Object.keys(fixedRules).forEach(function (action) {
            fixedRes[role][action] = fixedRules[action];
            fixedRes[role].actions.push(action);
          });
        });
      } else {
        // process and normalize given object
        Object.keys(res1[role]).forEach(function (action) {
          fixedRes[role][action] = toPromiseValue(res1[role][action]);
          fixedRes[role].actions.push(action);
        });
      }
    });
  });

  return fixedResources;
}

// compile all required middlewares per-resource
function buildMiddlewares(resources) {
  var fixedMiddleware = {};

  // we can register all resources through its keys
  Object.keys(resources).forEach(function (resourceName) {
    // regitry for the given resource
    Sc.ACL.addResource(new Sc.Resource(resourceName));

    // iterate through and append each role
    Object.keys(resources[resourceName]).forEach(function (roleName) {
      var fixedRole = resources[resourceName][roleName];

      // now, append the registered callbacks
      fixedRole.actions.forEach(function (actionName) {
        // pass the compiled callback as-is
        Sc.ACL.setRule(actionName, resourceName, roleName, fixedRole[actionName], 'TYPE_ALLOW');
      });

      // finally, we can create our middleware per-resource and actions
      fixedMiddleware[resourceName] = {};

      fixedRole.actions.forEach(function(actionName) {
        fixedMiddleware[resourceName][actionName] = Sc.ACL.can(actionName, resourceName);
      });
    });
  });

  return fixedMiddleware;
}

module.exports = {
  buildResources: buildResources,
  buildMiddlewares: buildMiddlewares
}
