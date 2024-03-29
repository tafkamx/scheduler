/**
 * Accounts are branch-specific entities that may or may not have a related User for authentication.
 * This Model provides access to the table that Accounts are stored in, and gives us some additional Class Methods for
 */
var Account = Class(M ,'Account').inherits(DynamicModel)({
  tableName: 'Accounts',

  validations: {
    userId: ['uuid'],
    branchId: ['required', 'uuid'],
    type: [
      {
        rule: function(val) {
          if (M.Account.types[val] === undefined)
            throw new Error('Invalid Account Type: ' + val);
        },
        message: 'Invalid Account Type.'
      },
      'required',
      'maxLength:25'
    ],
    firstName: ['maxLength:125'],
    lastName: ['maxLength:125'],
    dob: ['date'],
    locationId: [
      'uuid',
      {
        rule: function (val) {
          var that = this.target;

          return that._container.query('Location')
            .where('id', val)
            .then(function (res) {
              if (res.length === 0) {
                throw new Error( 'The locationId must exist');
              }
            });
        },
        message: 'The locationId must exist',
      }
    ],
  },

  /**
   * Update this Object to create more Account Types. The values should link to Model names to be used within DomainContainer.
   */
  types: {
    'Teacher': 'Teacher',
    'Student': 'Student',
    'Franchisee': 'Franchisee',
    'StaffMember': 'StaffMember',
  },

  /**
   * Retrieves account using the associated User ID and Branch ID. Useful for Authentication.
   *
   * @param UUID userId   User ID that's associated with the Account
   * @param UUID branchId Branch that the Account is associated with
   *
   * @return Promise object. Resolves to `false` if Account is not found. Otherwise, resolves with `Account` object.
   */
  getByUser: function(userId, branchId) {
    var model = this;

    return new Promise(function(resolve, reject) {
      model.prototype._container.get('Account').query().where({ 'user_id': userId, 'branch_id': branchId })
      .then(function(res) {
        var account = res[0];
        if(!account) return resolve(false);

        return account.getTypeInfo()
        .then(function() {
          resolve(account);
        });
      }).catch(reject);
    });
  },

  /**
   * Retrieves one Account with additional Account Type data via the Account's ID
   *
   * @param UUID account_id
   */
  getById: function(account_id) {
    var model = this;

    return new Promise(function(resolve, reject) {
      model.prototype._container.get('Account').query().where('id', account_id)
      .then(function(res) {
        var account = res[0];
        if(!account) return resolve(false);

        return account.getTypeInfo()
        .then(function() {
          resolve(account);
        });
      }).catch(reject);
    });
  },

  attributes: [
    'id',
    'userId',
    'branchId',
    'type',
    'firstName',
    'lastName',
    'dob',
    'createdAt',
    'updatedAt',
    'locationId',
  ],


  /**
   * Instance-scope methods/variables.
   */
  prototype: {

    /**
     * Account.prototype.init is automatically run by Krypton
     * We're using this for unwrapping the variable overloading by type during save, and for creating the Type data when the Account is created for future linkage
     */
    init: function(config) {
      DynamicModel.prototype.init.call(this, config);
      var instance = this;
      var possibleTypes = M.Account.types;

      // Creates an additional entiity for the Account Type's additional data
      instance.on('afterCreate', function(next) {
        var query = instance._container.create(possibleTypes[instance.type], { accountId: instance.id }); // Creates a new typeInfo Object in SQL

        query.then(function(res) {
          instance.typeInfo = res[0];
          next();
        }).catch(next);
      });

      // Create Location instance
      instance.on('afterCreate', function (next) {
        if (!instance.location) {
          return next();
        }

        instance._container.create('Location', instance.location)
          .then(function (location) {
            instance.locationId = location.id;

            instance.location = location;

            return instance._container.update(instance);
          })
          .then(function () {
            next();
          })
          .catch(next);
      });

      // Calls `typeInfo.save()`
      instance.on('afterSave', function(next) {
        if(instance.typeInfo)
          instance._container.update(instance.typeInfo).then(function() { next(); }).catch(next);
        else next();
      });
    },

    /**
     * Retrieve and overload Account Type data based on `Account.type`
     *
     * Usage note: This function requires to have ._container set in the model.
     */
    getTypeInfo: function() {
      // TODO make sure that `this` is the Account obect
      var possibleTypes = M.Account.types;
      if(possibleTypes[this.type] === undefined) return; // If we don't know the Type, we can't do anything

      var instance = this;
      return instance._container.query(possibleTypes[instance.type]).where({ 'account_id': instance.id }) // TODO as specified in DomainContainer spec
      .then(function(res) {
        if(!res.length) return; // If this is the case, then the type must not exist.
        var accountData = res[0];
        instance.typeInfo = accountData;
        var attributes = M[possibleTypes[instance.type]].attributes;

        // === Property Overloading ===
        attributes.forEach(function(a) {
          if(instance.hasOwnProperty(a)) return; // Only overload properties that are pertinent

          /* This is where the magic happens */
          Object.defineProperty(instance, a, { // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
            get: function() { return accountData[a]; },
            set: function(newValue) { accountData[a] = newValue; },
            enumerable: true,
            configurable: true
          });

        });

        // === Method Overloading ===
        var methods = M[possibleTypes[instance.type]].prototype;
        var blacklist = ['init', 'constructor'];

        for(var method in methods) {
          if(methods.hasOwnProperty(method) && blacklist[method] === undefined) {
            instance[method] = methods[method];
          }
        }

        return Promise.resolve(instance);
      });
    }
  }

});

module.exports = Account;
