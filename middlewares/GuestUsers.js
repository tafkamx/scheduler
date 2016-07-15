/**
* Handles authentication of guest accounts for Installations and Branches.
*
* *grantee* - A User who generated the access token and therefore, 'granted' access.
*             A grantee object is a slim version of the `User model` with only data properties.
*             A grantee object always has a `grants` property with details about what
*             access was granted, such as: `role`, `installationName` and `branchName`.
*             A grantee *may* have a `grantee` property with another grantee object.
*
* *req.session.guest* - Is an object with the `id` and `email` of a User that a guest will become.
*                       A `grantee` property can be found with a grantee objefct depicting who 
*                       granted access to the guest user.
*
* To determine if user is actually a guest user:  `const isGuest = Boolean(req.session.guest)`
*
* @module GuestUsers
*/
const onepath = require('onepath');
const nonces = onepath.require('~/../../lib/utils/nonces');
const loginTokenize = onepath.require('~/../../lib/utils/login-tokenize');

module.exports = GuestUsersMiddleware;

const INSTALL_MANAGER_URL = '/installation-manager';
const BRANCH_LOGIN_URL = '/login';
const INSTALL_MANAGER_LOGIN_URL = `${INSTALL_MANAGER_URL}${BRANCH_LOGIN_URL}`;

function GuestUsersMiddleware(req, res, next) {
  // Test if a guest session has expired
  if (req.session.guest) {
    gc(req.session.guest);
    if (!Object.keys(req.session.guest).length) {
      delete req.session.guest;
    }
  }

  // If we have a `guest_login_token`, setup their session and 
  // remove token from url by reloading page.
  if (req.query.guest_login_token) {
    var grantee = loginTokenize.validateToken(req.query.guest_login_token, req.installationName, req.branch);
    if (grantee) {
      return setGuestUser(req, grantee)
      .then(function(guest) {
        req.session.guest = guest;
        refreshWithoutAccessToken(req, res);
      })
      .catch(next)
    } else {
      return refreshWithoutAccessToken(req, res);
    }
  }

  // There is a guest session available, test if it is valid for current installation/branch.
  if (req.session.guest) {
    const installationName = req.installationName;
    const branchName = req.branch;
    const guest = req.session.guest;
    const grants = guest.grantee.grants;
    const requiredAccess = !branchName ? 'Installation' : 'Branch';
    if (requiredAccess === 'Installation') {
      if (grants.access !== requiredAccess) return next();
      if (grants.installationName !== installationName) return next();
    } else {
      if (grants.access !== requiredAccess) return next();
      if (grants.installationName !== installationName) return next();
      if (grants.branchName !== branchName) return next();      
    }
    loadGuestUser(req).then(next).catch(next);
  } else {
    next(); // This middleware has nothing to do with this request
  }
};

/**
* Sets a guest account to be a Franchisor
*/
function setGuestAsFranchisor(req, grantee) {
  return new Promise(function(resolve, reject) {
    InstallationManager.User.query()
    .select('Users.*')
    .leftJoin('UsersInfo', 'UsersInfo.user_id', 'Users.id')
    .where({'UsersInfo.role': 'Franchisor'})
    .limit(1)
    .then(function(users) {
      if (users.length) {
        var user = users[0];
        var guest = {id: user.id, email: user.email, grantee: grantee};
        resolve(guest);
      } else {
        reject(new Error('There is no Franchisor account available'));
      }
    })
    .catch(reject);
  });
}

/**
* Sets a guest account to be a franchisee
*/
function setGuestAsFranchisee(req, grantee) {
  return new Promise(function(resolve, reject) {
    req.container.query('User')
    .select('Users.*')
    .leftJoin('Accounts', 'Accounts.user_id', 'Users.id')
    .leftJoin('Franchisees', 'Franchisees.account_id', 'Accounts.id')
    .limit(1)
    .then(function(users) {
      if (users.length) {
        var user = users[0];
        var guest = {id: user.id, email: user.email, grantee: grantee};
        resolve(guest);
      } else {
        reject(new Error('There is no Franchisee account available.'));
      }
    })
    .catch(reject);
  });
}

/**
* Set a guest account session.
* Depending on what `role` is granted by the grantee provided, a user will either 
* be a `Franchisor` for an installation or a `Franchisee` for a branch.
*/
function setGuestUser(req, grantee) {
  var grantedRole = grantee.grants.role;
  if (grantedRole === 'Franchisee') {
    return setGuestAsFranchisee(req, grantee)
  } else if (grantedRole === 'Franchisor') {
    return setGuestAsFranchisor(req, grantee);
  } else {
    throw new Error(`Invalid role: ${grantedRole}`);
  }
}

/**
* A guest session has been detected, this will load their user information and set `req.user`,
* with a guest account.
*/
function loadGuestUser(req) {
  const guest = req.session.guest;
  const grants = guest.grantee.grants;
  if (grants.role === 'Franchisor') {
    return new Promise(function(resolve, reject) {
      InstallationManager.User.query()
      .where({id: guest.id})
      .limit(1)
      .then(function(users) {
        var user = users[0];
        if (user) {
          req.user = user;
          req.user.grantee = guest.grantee;
        }
        resolve();
      })
      .catch(reject);
    });
  } else if (grants.role === 'Franchisee') {
    return new Promise(function(resolve, reject) {
      req.container.query('User')
      .where({'id': guest.id})
      .limit(1)
      .then(function(users) {
        var user = users[0];
        if (user) {
          req.user = user;
          req.user.grantee = guest.grantee;
        }
        resolve();
      })
      .catch(reject);
    });
  } else {
    throw new Error(`Invalid role: ${grants.role}`);
  }
}

/**
* Refresh page removing an access_token param if it exists
* TODO: remove ONLY `guest_login_token` from url.
*
* @method refreshWithoutAccessToken
* @param req {Object} 
* @param res {Object} 
*/
function refreshWithoutAccessToken(req, res) {
  res.redirect(req.originalUrl.split('?').shift());
}

/**
* Utility to iterate recursively an object whose key contains a similar 
* object with the same key, and so on until key does not return an object with the key.
* 
* Similar to `Array.forEach();`, instead of a linear iteration, it is a recursive iteration.
* 
* @method forInEach
* @param object {Object}
* @param key {String}
* @param callback {Function}
*/
function forInEach(object, key, callback) {
  var target = object[key];
  if (target && typeof target === 'object') {
      callback(target);
      forInEach(target, key, callback);
  }
}

/**
* A guest may be a grantee, a grantee can have a nested grantee, with different privilages or `granted privilages`
*
* This method will remove the topmost grantee and replace it with its child grantee or leave the grantee as 
* a empty grantee (no properties) if there are no grantee children available.
*
* This is used by `gc`, since erasing a grantee start from the highest level to the lowest level or deph.
*
* @method popGrantee 
* @method guest {Object} `req.session.guest`
*/
function popGrantee(guest) {
  var grantee = guest.grantee;
  delete guest.grantee;
  if (grantee) {
    Object.keys(grantee).forEach(function(property) {
      guest[property] = grantee[property];
    });
  } else {
    Object.keys(guest).forEach(function(property) {
      delete guest[property];
    });
  }
}

/**
* Removes grantees that have been expired.
*
* Since a grantee is stored in a hierarchy, so a grantee can allow another grantee to exist, if the
* base grantee has expired then child grantees have also expired.
*
* @method gc
* @param guest {Object} `req.session.guest` or `grantee object`
*/
function gc(guest) {
  var now = Date.now();
  var pops = 0;
  var grantList = [];
  
  forInEach(guest, 'grantee', function(grantee) {
    grantList.push(grantee.grants);
  });
  
  grantList.reverse();
  
  for (var i = 0, l = grantList.length; i < l; i++) {
    if (grantList[i].expires < now) {
      pops = l - i + 1;
      break;
    }
  }

  while(pops--) popGrantee(guest);
}
