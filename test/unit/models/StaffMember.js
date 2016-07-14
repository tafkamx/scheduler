'use strict';

var Promise = require('bluebird');

describe('M.StaffMember', function () {

  var container = UNIT;

  var account;

  before(function () {
    this.timeout(8000);
    return Promise.resolve()
      .then(function () {
        return container.create('User', {
          email: 'boop@pep.com',
          password: '12345678',
        });
      })
      .then(function (user) {
        return container.create('Account', {
          userId: user.id,
          branchId: container.props.defaultBranchId,
          type: 'StaffMember',
        });
      })
      .then(function (res) {
        account = res;
      });
  });

  after(function () {
    this.timeout(8000);
    return truncate([
      container.get('StaffMember'),
      container.get('Account'),
      container.get('User')
    ]);
  });

  describe('Validations', function () {

    describe('account_id', function () {

      it('Should fail if undefined', function (done) {
        container.create('StaffMember', {})
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.accountId.message).to.equal('The accountId is required');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

      it('Should fail if accountId does not exist', function (done) {
        container.create('StaffMember', {
          accountId: '57621C7A-2133-11E6-AD2F-334F78850C6D',
        })
          .then(function () {
            expect.fail('should have rejected');
          })
          .catch(function (err) {
            try {
              expect(err.message).to.equal('1 invalid values');
              expect(err.errors.accountId.message).to.equal('The accountId does not exist.');
            } catch (err) {
              return done(err);
            }

            done();
          });
      });

    });

  });

});
