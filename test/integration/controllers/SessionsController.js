var assert = require('chai').assert;
var path = require('path');

var Knex,
  user1,
  user2,
  knexConfig,
  knexOneConfig,
  knexTwoConfig,
  knex1,
  knex2;

var _ = require('lodash');
var Promise = require('bluebird');

var installationOne = 'installation-one';
var installationTwo = 'installation-two';
var websiteUrl = CONFIG[CONFIG.environment].defaultDomainName;

var installationOneUrl = 'http://default.' + installationOne + '.' + websiteUrl;
var installationTwoUrl = 'http://default.' + installationTwo + '.' + websiteUrl;

var agent1 = sa.agent();
var agent2 = sa.agent();

describe('SessionsController', function() {
  before(function(done) {
    Knex = require('knex');

    knexConfig = require(path.join(process.cwd(), 'knexfile.js'));
    knexOneConfig = _.clone(knexConfig, true);
    knexTwoConfig = _.clone(knexConfig, true);

    knexOneConfig[CONFIG.environment].connection.database = installationOne.toLowerCase() + '-' + CONFIG.environment;

    knexTwoConfig[CONFIG.environment].connection.database = installationTwo.toLowerCase() + '-' + CONFIG.environment;

    knex1 = new Knex(knexOneConfig[CONFIG.environment]);
    knex2 = new Knex(knexTwoConfig[CONFIG.environment]);

    user1 = new User({
      email : 'installation.one.user@example.com',
      password : '12345678'
    });

    user2 = new User({
      email : 'installation.two.user@example.com',
      password : '12345678'
    });

    Promise.all([
      user1.save(knex1).then(function(res) {
        return res;
      }),
      user2.save(knex2).then(function(res) {
        return user2
      }).then(function(res) {
        res.activate().save(knex2).then(function(res) {
          return res;
        });
      }),

    ]).then(function(res) {
      done();
    }).catch(done);
  });

  it('Should fail login because the account has not been activated', function(done) {
    sa.agent().post(installationOneUrl + '/login')
      .send({ email: user1.email, password: user1.password})
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        assert(res.text.search('User not activated') !== -1, 'User not activated');
        done();
      });
  });

  it('Should login and activate with the users token', function(done) {
    sa.agent().get(installationOneUrl + '/login?email=false&token=' + user1.token)
    .end(function(err, res) {
      expect(err).to.be.equal(null);
      expect(res.status).to.be.equal(200);
      assert(res.text.search('"success": "Welcome to PatOS Installation."') !== -1, 'Logged in');
      done();
    })

  });

  it('Should login with the email/password', function(done) {
    sa.agent().post(installationOneUrl + '/login')
      .send({ email: user1.email, password: user1.password})
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        assert(res.text.search('"success": "Welcome to PatOS Installation."') !== -1, 'Logged in');
        done();
      });
  });

  it('Should logout', function(done) {
    var agent = sa.agent();
    agent.post(installationOneUrl + '/login')
      .send({ email: user1.email, password: user1.password})
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        assert(res.text.search('"success": "Welcome to PatOS Installation."') !== -1, 'Logged in');
        agent.get(installationOneUrl + '/logout')
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          assert(res.text.search('"success": "Signed off"') !== -1, 'Signed off');
          done();
        })

      });
  });

  it('Should not let a logged in user login', function(done) {
    var agent = sa.agent();
    agent.post(installationOneUrl + '/login')
      .send({ email: user1.email, password: user1.password})
      .end(function(err, res) {
        assert(res.text.search('"success": "Welcome to PatOS Installation."') !== -1, 'Logged in');

        agent.get(installationOneUrl + '/login')
        .end(function(err, res) {
          expect(err).to.be.equal(null);
          expect(res.status).to.be.equal(200);
          assert(res.text.search('"info": "You are already logged in"') !== -1, 'Already logged in');
          done();
        })

      });
  });

  it('Should not be logged-in in other installations', function(done) {
    var agent = sa.agent();

    agent.post(installationOneUrl + '/login')
      .send({
        email : user1.email,
        password : user1.password
      })
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);
        assert(res.text.search('"success": "Welcome to PatOS Installation."') !== -1, 'Logged in');

        agent.get(installationTwoUrl + '/login')
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.status).to.be.equal(200);
            assert(res.text.search('"info": "You are already logged in"') === -1, 'Not logged in');
            done();
          });
      });
  });

  it('Should be able to login to more than one installation', function(done) {
    var agent = sa.agent();

    agent.post(installationOneUrl + '/login')
      .send({
        email : user1.email,
        password : user1.password
      })
      .end(function(err, res) {
        expect(err).to.be.equal(null);
        expect(res.status).to.be.equal(200);

        agent.post(installationTwoUrl + '/login')
          .send({
            email : user2.email,
            password : user2.password
          })
          .end(function(err, res) {
            expect(err).to.be.equal(null);
            expect(res.status).to.be.equal(200);
            done();
          });

      });
  });

  after(function(done) {
    Promise.all([
      User.query(knex1).delete(),
      User.query(knex2).delete()
    ]).then(function() {
      done();
    });
  });
});
