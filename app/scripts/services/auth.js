'use strict';
angular.module('imvgm')
  .factory('AuthService', ['$rootScope', '$http', 'Base64', '$q', function ($rootScope, $http, Base64, $q) {
    var _login = function (username, password) {
      var deferred = $q.defer();

      $http.post('http://localhost:3030/auth/login', {
        username: username,
        password: password
      })
        .success(function(data) {
          if (data['auth-token']) {
            deferred.resolve(username + ':' + data['auth-token']);
          }
        })
        .error(function () {
          deferred.reject();
        });
      return deferred.promise;
    };

    return {
      login: _login
    };
  }]);


