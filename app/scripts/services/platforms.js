'use strict';
angular.module('imvgm')
  .factory('PlatformsService', ['$resource', 'apiHost', function($resource, apiHost) {
    return $resource(apiHost + '/platforms/:id', {
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

  // resource = tokenHandler.wrapActions( resource, ['index', 'query', 'create', 'update', 'destroy']);
  // return resource;

}]);
