'use strict';

var path = require('path');

var installation = 'installation-one';

var knex,
  Knex = require('knex'),
  knexConfig;

var agent = sa.agent();

describe('User', function () {

  before(function (done) {
    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexConfig[CONFIG.environment].connection.database = installation.toLowerCase() + '-' + CONFIG.environment;

    knex = new Knex(knexConfig[CONFIG.environment]);

    var user = new User({
      email: 'user-test@example.com',
      password: '12345678',
      role: 'student'
    });

    user.mailers = { user: new UserMailer({ installationUrl: 'something' }) };

    user.save(knex)
      .then(function () {
        return done();
      })
      .catch(done);
  });

  describe('Relations', function () {

    describe('info', function () {

      it('Should return a proper UserInfo object', function (doneTest) {
        User.query(knex)
          .include('info')
          .then(function (result) {
            expect(result.length).to.equal(1);

            var user = result[0];

            expect(user).to.be.an('object');
            expect(user.constructor.className).to.equal('User');
            expect(user.info).to.be.an('object');
            expect(user.info.constructor.className).to.equal('UserInfo');
          })
          .then(doneTest)
          .catch(doneTest);
      });

    });

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
