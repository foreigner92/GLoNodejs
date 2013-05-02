'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', '$http', '$route', 'PlatformsService', 'PlatformsService', function($rootScope, $scope, User, auth, $http, $route, Platform, Genre) {

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
    };

    $scope.getUsers = function (id) {
      auth.getCurrentUser()
        .then(function (user) {
          console.log(user);
        });
    };

    $scope.platformSelectOptions = {
      data: function () {
        return {
          results: $scope.platforms
        }
      }
    };

    $scope.genresSelectOptions = {
      data: function () {
        return {
          results: $scope.genres
        }
      }
    };

    Platform.index(function (platforms) {
      $scope.platforms = platforms.map(function (platform) {
        return {
          id: platform.id,
          text: platform.name
        };
      });
    });

    Genre.index(function (genres) {
      $scope.genres = genres.map(function (genre) {
        return {
          id: genre.id,
          text: genre.name
        };
      });
    });

  }]);


