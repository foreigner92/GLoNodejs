'use strict';
angular.module('imvgm')
  .factory('AuthService', ['$rootScope', '$http', 'Base64', '$q', 'UsersService', '$resource', 'apiHost', '$location', function($rootScope, $http, Base64, $q, User, $resource, apiHost, $location) {
  var _login = function(username, password) {
    var deferred = $q.defer();

    $http.post('http://localhost:3030/auth/login', {
      username: username,
      password: password
    })
    .success(function(data) {
      console.log('success');
      if (data['auth-token']) {
        deferred.resolve(data);
      }
    })
    .error(function(err) {
      console.log('error');
      deferred.reject(err);
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

  var _logout = function () {
    delete sessionStorage.authToken;
    delete sessionStorage.user;
    delete $http.defaults.headers.common['Auth-Token'];
    $location.path('/');
  }

  var _getCurrentUser = function () {

    var deferred = $q.defer();
    var user = sessionStorage.getItem('user');
    console.log(user);
    deferred.resolve(JSON.parse(user));
    // User.get({id: userId}, function (user) {
    //   deferred.resolve(user);
    // });

    return deferred.promise;
  };

  var _userIsLoggedIn = function () {
    // var deferred = $q.defer();

    // var user = _getCurrentUser().then(function () {
    //   console.log(user);
    //   if (user) {
    //     deferred.resolve(user);
    //   } else {
    //     deferred.reject();
    //   }
    // });

    // return deferred.promise.then(function (user) {
    //   return user || null;
    // }, function () {
    //   return false;
    // });
    //
    return sessionStorage.getItem('user') || false;
  };

  return {
    login: _login,
    register: _register,
    logout: _logout,
    getCurrentUser: _getCurrentUser,
    userIsLoggedIn: _userIsLoggedIn
  };
}]);
