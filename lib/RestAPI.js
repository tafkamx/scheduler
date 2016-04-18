var _ = require('lodash');
var Promise = require('bluebird');

var RestAPI = Class('RestAPI')({
  prototype : {
    model : null,
    queryBuilder : null,
    req : null,
    res : null,
    responseHeaders : null,

    init : function(config) {
      Object.keys(config || {}).forEach(function (propertyName) {
          this[propertyName] = config[propertyName];
      }, this);

      this.queryBuilder = this.model.query();

      this.req.currentQuery = this.queryBuilder;

      this.responseHeaders = {};

      return this;

    },

    exec : function() {
      var api = this;

      return Promise.all([
        new Promise(function(res, rej) {
          if (api.req.query.q) {
            return res(api.search(api.req.query.q))
          } else {
            return res(Promise.resolve());
          }
        }),
        this.paginate()
      ]);
    },

    search : function() {
      return Promise.resolve();
    },

    paginate : function() {
      var api = this;
      var qs = this.req.query;

      var hasPage = false;
      var hasPerPage = false;

      return new Promise(function(resolve, reject) {
        Object.keys(qs || {}).forEach(function(param) {
          switch (param) {
            case 'page':
              hasPage = qs[param];
              break;
            case 'perPage':
              hasPerPage = qs[param];
              break;
          }
        });

        if (hasPage && hasPerPage) {
          var queryMethodCalls = [];

          if (_.parseInt(hasPage -1) < 0) {
            return reject(new Error('Page number must be a positive integer'));
          }

          if (_.parseInt(hasPerPage) <= 0) {
            return reject(new Error('Per Page number must be a positive integer'));
          }

          var tmpQuery = Object.create(api.queryBuilder);

          return Promise.all([
            new Promise(function(res, rej) {
              api.queryBuilder.orderBy('created_at', 'asc').page(_.parseInt(hasPage) -1, _.parseInt(hasPerPage))


              api.queryBuilder._queryMethodCalls.forEach(function(item) {
                if (item.method !== 'offset' && item.method !== 'limit' && item.method !== 'orderBy') {
                  queryMethodCalls.push(item);
                }
              });

              return res(api.queryBuilder);
            }),

            new Promise(function(res, rej) {
              tmpQuery._queryMethodCalls = queryMethodCalls;
              return tmpQuery
                .count('*')
                .then(function(result) {
                  var totalCount = result[0].count
                  api.responseHeaders.total_count = totalCount;

                  var totalPages = _.parseInt(Math.round(totalCount / _.parseInt(hasPerPage)));

                  api.responseHeaders.total_pages = totalPages;

                  return res(true);

                });
            })
          ]).then(function(){
            // Set Headers
            Object.keys(api.responseHeaders).forEach(function(header) {
              api.res.set(header, api.responseHeaders[header]);
            });

            return resolve(api);
          });
        } else {
          return resolve(api);
        }

      });
    }
  }
});

module.exports = RestAPI;
