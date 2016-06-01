'use strict';

var path = require('path');
var uuid = require('uuid');

describe('M.Acccount', function() {

  var container = UNIT;

  var cleanup = function () {
    return promiseSeries([
      container.get('Teacher').query().delete(),
      container.get('Account').query().delete(),
      container.get('User').query().delete(),
    ]);
  };

  beforeEach(cleanup);
  after(cleanup);

  var createTeacherAccount = function () {
    return container
      .create('User', {
        email: 'user-account-test@example.com',
        password: '12345678',
      })
      .then(function (user) {
        return container.create('Account', {
          userId: user.id,
          branchName: 'default',
          type: 'teacher',
        });
      });
  };

  describe('Methods', function () {

    beforeEach(createTeacherAccount);

    describe('#getTypeInfo', function () {

      it('Should have typeInfo related to User Type', function () {
        return container.get('Account').query()
          .then(function (res) {
            expect(res.length).to.equal(1);

            return res[0].getTypeInfo();
          })
          .then(function (acc) {
            expect(acc).to.have.ownProperty('branchName');
            expect(acc).to.have.ownProperty('active');
            expect(acc.active).to.equal(false);
          });
      });

    });

  });

  describe('Static methods', function () {

    beforeEach(createTeacherAccount);

    describe('::getById', function () {

      it('Should work through `container.get(Account).getById`', function () {
        return container.query('Account')
          .then(function (res) {
            expect(res.length).to.equal(1);

            return container.get('Account').getById(res[0].id);
          })
          .then(function(account) {
            expect(account).to.have.ownProperty('active');
          });
      });

    });

    describe('::getByUser', function () {

      it('Should work through `container.get(Account).getByUser`', function () {
        return container.query('Account')
          .then(function (res) {
            expect(res.length).to.equal(1);

            return container.get('Account').getByUser(res[0].userId, res[0].branchName);
          })
          .then(function (acc) {
            expect(acc).to.have.ownProperty('active');
          });
      });

    });

  });

  it('Should save Account Type data on save', function () {
    return createTeacherAccount()
      .then(function (acc) {
        return acc.getTypeInfo();
      })
      .then(function (acc) {
        expect(acc.active).to.equal(false);
        expect(acc.typeInfo.active).to.equal(false);

        acc.active = true; // should be reflected in acc.typeInfo
        expect(acc.active).to.equal(true);
        expect(acc.typeInfo.active).to.equal(true);

        return container.update(acc);
      })
      .then(function (acc) {
        return container.query('Teacher').where('account_id', acc.id);
      })
      .then(function (res) {
        expect(res[0].active).to.equal(true);
      });
  });

});
