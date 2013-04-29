'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', '$http', '$route',  function($rootScope, $scope, User, auth, $http, $route) {


    console.log($route);
    $scope.login = function () {
      auth.login($scope.login.username, $scope.login.password)
        .then(function (data) {
          $http.defaults.headers.common['Auth-Token'] = data.user.username + ':' + data['auth-token'];
          // Store authToken and userId in sessionStorage
          sessionStorage.setItem('authToken', data.user.username + ':' + data['auth-token']);
          sessionStorage.setItem('userId', data.user.id);
          $rootScope.$broadcast('event:loggedIn');
          window.location = '/#/';
        });

    };

    $scope.register = function () {
      auth.register($scope.formData)
        .then(
          // Callback
          function (user) {
            console.log(user);
          },
          // Errback
          function (err) {
            console.log(err);
          }
        );
    }

    $scope.getUsers = function (id) {
      auth.getCurrentUser()
        .then(function (user) {
          console.log(user);
        });
    };

  }]);


