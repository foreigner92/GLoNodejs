'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'AuthService', '$http', function($rootScope, $scope, $auth, $http) {

    $scope.login = function() {
      $auth.login($scope.login.username, $scope.login.password)
        .then(function (authToken) {
          $http.defaults.headers.common['Auth-Token'] = authToken;
          sessionStorage.setItem("authToken", authToken);
          $rootScope.$broadcast('event:loggedIn')
        });
    };

    $scope.getUsers = function() {
      $http.get('http://localhost:3030/users');
    };
  }]);


