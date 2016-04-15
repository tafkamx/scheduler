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

    },

    exec : function() {
      return Promise.all([
        this.search(),
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

          var tmpQuery = Object.create(api.queryBuilder);

          return Promise.all([
            new Promise(function(res, rej) {
              api.queryBuilder.page(_.parseInt(hasPage), _.parseInt(hasPerPage))

              api.queryBuilder._queryMethodCalls.forEach(function(item) {
                if (item.method !== 'offset' && item.method !== 'limit') {
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
                  api.responseHeaders.total_count = result[0].count;

                  return res(true);

                })
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
