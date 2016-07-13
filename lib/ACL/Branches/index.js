module.exports = {
  Visitor: [true],
  Franchisor: [true],
  Franchisee: [
    [true], // ALL REST Methods
    ['index', true], // Allow Index
    ['edit', function(req) { // Allow Edit if user.account.branch.id === req.params.id
      return req.container.query('Account')
        .include('branch')
        .where('user_id', req.user.id)
        .then(accounts => {
          if (accounts.length === 0) {
            return false;
          }

          var account = accounts[0];

          if (!account.branch) {
            return false;
          }

          if (account.branch.id === req.params.id) {
            return true
          }

          return false;
        });
    }]
  ]
};
