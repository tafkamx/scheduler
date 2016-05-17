/**
 * Accounts are branch-specific entities that may or may not have a related User for authentication.
 * This Model provides access to the table that Accounts are stored in, and gives us some additional Class Methods for
 */
var Account = Class(M ,'Account').inherits(DynamicModel)({
  tableName: 'Accounts',

  /* Validations for this table are very simple. Everything but the branchId and type is optional. */
  validations: {
    userId: ['uuid'],
    branchName: ['required', 'maxLength:255'],
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
    dob: ['date'], // TODO test this for compatibility with Knex. This requires a JavaScript date object
    addressLine1: ['maxLength:255'],
    addressLine2: ['maxLength:255'],
    city: ['maxLength:255'],
    state: ['maxLength:255'],
    country: ['maxLength:48'],
    postalCode: ['maxLength:48']
  },

  /**
   * Update this Object to create more Account Types. The values should link to Model names to be used within DomainContainer.
   */
  types: {
    'teacher': 'Teacher',
    'student': 'Student'
  },

  /**
   * Retrieves account using the associated User ID and Branch ID. Useful for Authentication.
   *
   * @param UUID userId     User ID that's associated with the Account
   * @param UUID branchName Branch that the Account is associated with
   *
   * @return Promise object. Resolves to `false` if Account is not found. Otherwise, resolves with `Account` object.
   */
  getByUser: function(userId, branchName) {
    var model = this;

    return new Promise(function(resolve, reject) {
      model.prototype._container.get('Account').query().where({ 'user_id': userId, 'branch_name': branchName })
      .then(function(res) {
        var account = res[0];
        if(!account) return resolve(false);

        account.getTypeInfo()
        .then(function() {
          resolve(account);
        })
        .catch(function() {
          resolve(false);
        });
      });

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

        account.getTypeInfo()
        .then(function() {
          resolve(account);
        })
        .catch(function() {
          resolve(false);
        });
      });

    });
  },

  attributes: [
    'id',
    'userId',
    'branchName',
    'type',
    'firstName',
    'lastName',
    'dob',
    'addressLine1',
    'addressLine2',
    'city',
    'postalCode',
    'createdAt',
    'updatedAt'
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
        });
      });

      // Calls `typeInfo.save()`
      instance.on('afterSave', function(next) {
        if(instance.typeInfo)
          instance._container.update(instance.typeInfo).then(function() { next(); }).catch(next);
        else next();
      });
    },

    /**
     * Account-Type-specific data is stored here for overloading and access on afterSave event.
     */
    typeInfo: {
      save: function() { return Promise.resolve(); }
    },

    /**
     * Retrieve and overload Account Type data based on `Account.type`
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

        // TODO Create functions within `this.prototype` based on `res.prototype`
      });
    }
  }

});

module.exports = Account;
