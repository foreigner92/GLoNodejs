'use strict';
angular.module('resources.platforms', ['ngResource', 'gloliquid'])
angular.module('resources.platforms')
.factory('Platform', ['$resource', 'CONFIG', function($resource, config) {
    return $resource(config.api.host.replace(/:([0-9].*)$/,'\\:' + config.api.host.match(/([0-9].*)$/)[0]) + '/platforms/:id', {
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
