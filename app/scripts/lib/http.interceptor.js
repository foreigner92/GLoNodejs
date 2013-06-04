'use strict';
// register the interceptor as a service
angular.module('imvgm')
  .factory('httpInterceptor', ['$q', '$rootScope',  function($q, $rootScope) {

  function success(response) {
    return response;
  }

  function error(response) {
    var status = response.status;

    // Check for connection
    if (status === 0) {
      // Broadcast a networkError event to the $rootScope
      $rootScope.$broadcast('event:networkError');
    }

    // Check for 401 (Unauthorised) response
    if (status === 401) {
      // Broadcast a loginRequired event to the $rootScope
      $rootScope.$broadcast('event:loginRequired');
    }

    // reject and return the deferred.
    return $q.reject(response);
  }

  return function(promise) {
    return promise.then(success, error);
  };

}]);
