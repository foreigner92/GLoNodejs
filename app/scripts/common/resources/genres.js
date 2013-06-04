'use strict';
angular.module('resources.genres', ['ngResource', 'gloliquid'])
angular.module('resources.genres')
.factory('Genre', ['$resource', 'CONFIG', function($resource, config) {

    return $resource(config.api.host.replace(/:([0-9].*)$/,'\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/genres/:id', {
      id: '@id'
    }, {
      'index': {
        method: 'GET',
        isArray: true
      },
      'get': {
        method: 'GET'
      },
      'create': {
        method: 'POST'
      },
      'update': {
        method: 'PUT'
      },
      'destroy': {
        method: 'DELETE'
      }
    });
}]);
