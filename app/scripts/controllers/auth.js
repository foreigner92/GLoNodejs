'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', function($rootScope, $scope, User, auth) {

    $scope.registerUser = function () {

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
    };

    $scope.getUsers = function () {
      auth.getCurrentUser()
        .then(function (user) {
          console.log(user);
        });
    };

  }]);


