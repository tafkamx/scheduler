'use strict';

module.exports = function (actions, resource) {
  return actions.map(function (action) {
    return {
      actions: [action],
      before: [Sc.ACL.can(action, resource)]
    };
  });
};
