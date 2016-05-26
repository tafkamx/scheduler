'use strict';

var path = require('path');
var _ = require('lodash');
var RESTFulAPI = require(path.join(process.cwd(), 'lib', 'RESTFulAPI'));

describe('RESTFulAPI', function() {

  var container = UNIT;

  var config = {
    req : null,
    res : null,
    queryBuilder : null,
    order : null,
    paginate : null,
    filters : null,
  }

  describe('Initialization', function() {

    it('Should throw an error if req is not provided', function() {
      var func = function () {
        new RESTFulAPI({
          req : null,
          res : {}, // mock ResponseObject
          queryBuilder : {}
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if res is not provided', function() {
      var func = function () {
        new RESTFulAPI({
          req : {}, // mock RequestObject
          res : null,
          queryBuilder : {}
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if paginate.pageSize is not provided', function() {
      var func = function () {
        new RESTFulAPI({
          req : {},
          res : null,
          queryBuilder : {},
          order : {}
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if filters.allowedFields is not provided or is not an array', function() {
      var func = function () {
        new RESTFulAPI({
          req : {},
          res : {},
          queryBuilder : {},
          filters : {
            allowedFields : 'x'
          },
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if order.default is not provided', function() {
      var func = function () {
        new RESTFulAPI({
          req : {},
          res : {},
          queryBuilder : {},
          order : {}
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if order.allowedFields is not provided or is not an array', function() {
      var func = function () {
        new RESTFulAPI({
          req : {},
          res : {},
          queryBuilder : {},
          order : {
            default : 'x',
            allowedFields : 'x'
          }
        });
      }

      expect(func).to.throw(Error);
    });

    it('Should throw an error if queryBuilder is not Krypton.QueryBuilder', function() {
      var func = function () {
        new RESTFulAPI({
          req : {},
          res : {},
          queryBuilder : {}
        });
      }

      // console.log(func())

      expect(func).to.throw(Error);
    });

    it('Should create an instance', function() {
      var api = new RESTFulAPI({
        req : {},
        res : {},
        queryBuilder : InstallationManager.Installation.query()
      });

      expect(api).to.be.an.instanceof(RESTFulAPI);
    });
  });

  describe('Static Methods', function() {
    it('createMiddleware() should create an instance', function() {
      var req = {
        query : {}
      };
      var res = {
        set : function(key, value) {
          res.headers[key] =  value;
        },
        headers : {},
        locals : {}
      };
      var next = function() {};

      var fn = function() {
        RESTFulAPI.createMiddleware({
          queryBuilder : InstallationManager.Installation.query()
        })(req, res, next);
      }

      expect(res.locals.response).to.exists;
      expect(res.headers['total_count']).to.exists;
      expect(res.headers['total_pages']).to.exists;
    });
  });
});
