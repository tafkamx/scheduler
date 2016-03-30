'use strict';

var path = require('path');

var installation = 'installation-one';

var knex,
  Knex = require('knex'),
  knexConfig;

var agent = sa.agent();

describe('UserInfo', function () {

  before(function (done) {
    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);

    var user = new User({
      email: 'user-test@example.com',
      password: '12345678',
      role: 'student'
    });

    user.save(knex)
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        UserInfo.query(knex)
          .include('user')
          .then(function (result) {
            expect(result.length).to.equal(1);

            var info = result[0];

            expect(info).to.be.an('object');
            expect(info.constructor.className).to.equal('UserInfo');
            expect(info.user).to.be.an('object');
            expect(info.user.constructor.className).to.equal('User');
          })
          .then(doneTest)
          .catch(doneTest);
      });

    });

  });

  describe('Constraints', function () {
  });

  after(function (done) {
    Promise.all([
      User.query(knex).delete(),
      UserInfo.query(knex).delete()
    ])
      .then(function () {
        return done();
      })
      .catch(done);
  });

});
