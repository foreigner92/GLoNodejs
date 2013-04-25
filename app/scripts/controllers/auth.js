'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', '$http',  function($rootScope, $scope, User, auth, $http) {

    $scope.login = function() {
      auth.login($scope.login.username, $scope.login.password)
        .then(function (data) {
          $http.defaults.headers.common['Auth-Token'] = data.user.username + ':' + data['auth-token'];

          // Store authToken and userId in sessionStorage
          sessionStorage.setItem('authToken', data.user.username + ':' + data['auth-token']);
          sessionStorage.setItem('userId', data.user.id);

          $rootScope.$broadcast('event:loggedIn');

        });

    };

    $scope.getUsers = function(id) {
      auth.getCurrentUser()
        .then(function (user) {
          console.log(user);
        });
    };

  }]);


