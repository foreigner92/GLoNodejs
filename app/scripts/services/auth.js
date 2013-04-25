'use strict';
angular.module('imvgm')
  .factory('AuthService', ['$rootScope', '$http', 'Base64', '$q', 'UsersService', '$resource', 'apiHost', function($rootScope, $http, Base64, $q, User, $resource, apiHost) {
  var _login = function(username, password) {
    var deferred = $q.defer();

    $http.post('http://localhost:3030/auth/login', {
      username: username,
      password: password
    })
    .success(function(data) {
      if (data['auth-token']) {
        deferred.resolve(data);
      }
    })
    .error(function() {
      deferred.reject();
    });
    return deferred.promise;
  };

  var _register = function (accountDetails) {
    var deferred = $q.defer();

    var UserRegistration = $resource(apiHost + '/auth/register', {}, {
      'create': {
        method: 'POST'
      }
    });

    var registration = new UserRegistration(accountDetails);
    registration.$save(
      function (user) {
        deferred.resolve(user);
      },
      function (err) {
        deferred.reject(err);
      }
    );

    return deferred.promise;
  };

  var _getCurrentUser = function() {
    var deferred = $q.defer();
    var userId = sessionStorage.getItem('userId');

    User.get({id: userId}, function (user) {
      deferred.resolve(user);
    });

    return deferred.promise;
  };

  return {
    login: _login,
    register: _register,
    getCurrentUser: _getCurrentUser
  };
}]);
