/**
 *
 */
var Account = Class('Account').inherits(DynamicModel)({
  tableName: 'Accounts',

  /**
   * Retrieves account using the associated User ID and Branch ID. Useful for Authentication.
   */
  authenticate: function(user_id, branch_id) {
    var model = this;

    return Promise(function() {
      var query = model.query({ user_id: user_id, branch_id: branch_id }); // Need to update to work with DomainContainer

      query.then(function(res) {}); // Attch Account Type data
    });
  },

  retrieve: function(account_id) {

  },

  attributes: [
    'id',
    'user_id',
    'branch_id',
    'type',
    'first_name',
    'last_name',
    'dob',
    'address_line1',
    'address_line2',
    'city',
    'createdAt',
    'updatedAt'
  ],

  prototype: {

    /**
     *
     */
    getTypeInfo: function() {

    }
  }
});

module.exports = Account;
