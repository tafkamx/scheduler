'use strict';

Class(PAT, 'App')({

  prototype: {

    // Gets set at setup, contains query string params when page is loaded
    queryParams: null,

    setup: function () {
      this.getQueryStringParams();

      return this;
    },

    // Copied from http://stackoverflow.com/a/2880929/1622940
    // For the time being I think it is an acceptable solution
    getQueryStringParams: function () {
      var urlParams = {};

      var match,
        pl = /\+/g, // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
          return decodeURIComponent(s.replace(pl, ' '));
        },
        query = window.location.search.substring(1);

      while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
      }

      this.queryParams = urlParams;
    }

  }

});
