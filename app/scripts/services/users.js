'use strict';
angular.module('imvgm')
  .factory('UsersService', ['$resource', function($resource) {
    return $resource('http://localhost\::port/users/:id', {
      id: '@id',
      port: 3030
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
