'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', '$http', 'PlatformsService', 'GenresService', '$dialog', '$location', function($rootScope, $scope, User, auth, $http, Platform, Genre, $dialog, $location) {



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

    $scope.platformSelectOptions = {
      data: function () {
        return {
          results: $scope.platforms
        };
      }
    };

    $scope.genresSelectOptions = {
      data: function () {
        return {
          results: $scope.genres
        };
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


