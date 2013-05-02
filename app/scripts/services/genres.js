'use strict';
angular.module('imvgm')
  .factory('GenresService', ['$resource', 'apiHost', function($resource, apiHost) {
    return $resource(apiHost + '/genres/:id', {
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
