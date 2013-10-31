'use strict';
angular.module('resources.users', ['ngResource', 'config'])
angular.module('resources.users')
.factory('User', ['$resource', 'config', function($resource, config) {
    return $resource(config.api.host.replace(/:([0-9].*)$/,'\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/users/:id', {
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

