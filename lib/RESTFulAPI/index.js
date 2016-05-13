var _ = require('lodash');

var RESTFulAPI = Class({}, 'RESTFulAPI')({
  COMPARISON_OPERATORS : {
    '$eq' : '=',
    '$ne' : '<>',
    '$lt' : '<',
    '$lte' : '<=',
    '$gt' : '>',
    '$gte' : '>=',
    '$in' : 'IN',
    '$nin' : 'NOT IN',
    '$like' : 'LIKE',
    '$ilike' : 'ILIKE'
  },

  CLAUSES : {
    '$and' : 'where',
    '$or' : 'orWhere'
  },

  createMiddleware : function(config) {
    return (function(req, res, next) {
      config.req = req;
      config.res = res;

      var restApi = new RESTFulAPI(config);

      restApi.build()
        .then(function(results) {
          res.locals.results = results;
          return next();
        })
        .catch(next);
    });
  },

  prototype : {
    req : null,
    res : null,
    queryBuilder : null,
    order : null,
    paginate : null,
    filters : null,

    init : function(config) {
      this.paginate = {
        pageSize : 50
      }

      this.filters = {
        allowedFields : []
      }

      this.order = {
        default : '-created_at',
        allowedFields : ['created_at']
      }

      _.assign(this, config);

      return this;
    },

    _buildOrder : function() {
      var order = this.req.query.order || this.order.default;

      var sortOrder,
        field;

      if (order.indexOf('-') === 0) {
        sortOrder = 'DESC';
        field = order.substr(1, order.length - 1);
      } else {
        sortOrder = 'ASC';
        field = order;
      }

      if (_.includes(this.order.allowedFields, field)) {
        this.queryBuilder.orderBy(field, sortOrder);
      }

      return this;
    },

    _buildFilters : function() {
      this._filtersToQueryBuilder(this.req.query.filters | {});

      return this;
    },

    _filtersToQueryBuilder : function(filters, parentKey) {
      var restApi = this;

      Object.keys(filters).forEach(function(key) {
        var value = filters[key];

        var methodName = restApi.constructor.CLAUSES[key];

        if (methodName) {
          // key === '$and' || '$or'
          return restApi._filtersToQueryBuilder(value, key);
        } else {
          if (_.isPlainObject(value)) {
            // key === '{field_name}'
            return restApi._filtersToQueryBuilder(value, key);
          } else {
            var column,
              operator;

            if (parentKey) {
              if (restApi.constructor.COMPARISON_OPERATORS[key]) {
                operator = restApi.constructor.COMPARISON_OPERATORS[key];
                column = parentKey;
              } else {
                methodName = restApi.constructor.CLAUSES[parentKey];
                column : key;
              }
            }

            column = column || key;
            operator = operator || '=';
            methodName = methodName || 'where';

            if (_.includes(restApi.filters.allowedFields, column)) {
              restApi.queryBuilder[methodName](column, operator, value);
            }
          }
        }
      });
    },

    _buildPagination : function() {
      var restApi = this;
      var orderClause;
      var currentPage = Math.abs(parseInt(restApi.req.query.page, 10) || 1);

      // Remove the orderBy clause since can't count with an order clause;
      restApi.queryBuilder._queryMethodCalls.forEach(function(item) {
        if (item.method === 'orderBy') {
          var index = restApi.queryBuilder._queryMethodCalls.indexOf(item);
          orderClause = restApi.queryBuilder._queryMethodCalls.splice(index, 1)[0];
        }
      });

      return restApi.queryBuilder.count('*').then(function(result) {
        var total = result[0].count;
        var pages = Math.round(total / restApi.paginate.pageSize);

        restApi.res.set('total_count', total);
        restApi.res.set('total_pages', pages);

        // Remove count call from previous query.
        restApi.queryBuilder._queryMethodCalls.forEach(function(item) {
          if (item.method === 'count') {
            var index = restApi.queryBuilder._queryMethodCalls.indexOf(item);
            restApi.queryBuilder._queryMethodCalls.splice(index, 1)[0];
          }
        });

        // Put back the orderBy clause if exists
        if (orderClause) {
          restApi.queryBuilder._queryMethodCalls.push(orderClause);
        }

        return restApi.queryBuilder.page(currentPage, restApi.paginate.pageSize);
      });
    },

    build : function() {
      this._buildOrder()
        ._buildFilters();

      return this._buildPagination().then(function(queryBuilder) {
        return queryBuilder;
      });
    }
  }
});

module.exports = RESTFulAPI;
