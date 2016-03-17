if (CONFIG[CONFIG.environment].sessions !== false) {

  var redis = require('redis');

  var redisClient = redis.createClient();

  var session = require('express-session');

  var RedisStore = require('connect-redis')(session);

  var redisStoreInstance = new RedisStore();

  var uuid = require('uuid');

  module.exports = function(req, res, next) {
    var args = Array.prototype.slice.call(arguments, 0);
    var sessionMiddleWare = session({
      genid : function(req) {
        return uuid.v4();
      },
      resave : false,
      saveUninitialized : true,
      key : req.installationId || CONFIG[CONFIG.environment].sessions.key,
      store: redisStoreInstance,
      secret: CONFIG[CONFIG.environment].sessions.secret,
      // cookie: { secure: true }
    });

    sessionMiddleWare.apply(this, args);
  }
} else {
  module.exports = function(req, res, next) {
    next();
  }
}
