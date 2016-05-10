/**
 * Accounts are branch-specific entities that may or may not have a related User for authentication.
 * This Model provides access to the table that Accounts are stored in, and gives us some additional Class Methods for
 */
var Account = Class('Account').inherits(DynamicModel)({
  tableName: 'Accounts',

  validations: {
    userId: ['uuid'],
    branchId: ['required', 'uuid'],
    type: [
      {
        rule: function (val) {
          if (this.types.indexOf(val) === -1) {
            throw new Error('Invalid Account Type: ' + val);
          }
        },
        message: 'Invalid Account Type.'
      },
      'required',
      'maxLength:25'
    ],
    firstName: ['maxLength:125'],
    lastName: ['maxLength:125'],
    // TODO dob (date?)
    addressLine1: ['maxLength:255'],
    addressLine2: ['maxLength:255'],
    city: ['maxLength:255'],
    state: ['maxLength:255'],
    country: ['maxLength:48'],
    postalCode: ['maxLength:48'],

  },

  /**
   * Update this Object to create more Account Types. The values should link to Model names to be used within DomainContainer.
   */
  types: {
    'teacher': 'Teacher',
    'stduent': 'Student'
  },

  /**
   * Retrieves account using the associated User ID and Branch ID. Useful for Authentication.
   *
   * @param UUID user_id   User ID that's associated with the Account
   * @param UUID branch_id Branch that the Account is associated with
   *
   * @return Promise object. Resolves to `false` if Account is not found. Otherwise, resolves with `Account` object.
   */
  getByUser: function(user_id, branch_id) {
    var model = this;

    return Promise(function(resolve, reject) {
      var query = model.query({ user_id: user_id, branch_id: branch_id }); // Need to update to work with DomainContainer

      query.then(function(res) { // Attch Account Type data
        if(!res.length) return resolve(false); // Don't want to `reject` for the sake of usability

        var account = res[0]; // There should only be one Account here.
        account.getTypeInfo().then(resolve); // Account gets its additional data by reference
      });
    });
  },

  /**
   * Retrieves one Account with additional Account Type data
   */
  get: function(account_id) {

  },

  attributes: [
    'id',
    'userId',
    'branchId',
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

  prototype: {
    /**
     * Account-Type-specific data is stored here.
     */
    typeInfo: {
      save: function() {}
    },

    /**
     * Retrieve and overload Account Type data based on `Account.type`
     */
    getTypeInfo: function() {
      // TODO make sure that `this` is the Account obect
      var possibleTypes = Account.types; // TODO check this for usability with DomainContainer
      if(possibleTypes.indexOf(this.type) === -1) return; // If we don't know the Type, we can't do anything

      this._container.query(possibleTypes[this.type]).where({ 'account_id': this.id }) // TODO as specified in DomainContainer spec
      .then(function(res) {
        // Overload attributes
        // Create functions within `this.prototype` based on `res.prototype`
      });
    }
  }

});

module.exports = Account;
