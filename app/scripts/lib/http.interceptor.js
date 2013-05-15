'use strict';
// register the interceptor as a service
angular.module('imvgm')
  .factory('httpInterceptor', ['$q', '$rootScope',  function($q, $rootScope) {

  function success(response) {

    return response;

  }

  function error(response) {
    var status = response.status;

    if (status === 401) {

      $rootScope.$broadcast('event:loginRequired');
      return;
    }
    // otherwise
    return $q.reject(response);
  }

  return function(promise) {
    return promise.then(success, error);
  };

}]);
