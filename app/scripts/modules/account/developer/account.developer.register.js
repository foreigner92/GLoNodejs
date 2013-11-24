angular.module('account.developer.register', ['resources.platforms', 'resources.genres', 'directives.remoteForm'])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/account/register/developer', {
    templateUrl:'account/developer/account.developer.register.tpl.html',
    controller:'AccountDeveloperRegisterCtrl',
  });
}])
.controller('AccountDeveloperRegisterCtrl', ['$scope', '$location', 'Platform', 'Genre', function ($scope, $location, Platform, Genre) {

  $scope.newUser = {
    role: 'game_developer'
  };

  // $scope.platformSelectOptions = {
  //   data: function () {
  //     return {
  //       results: $scope.platforms
  //     };
  //   }
  // };

  // $scope.genresSelectOptions = {
  //   data: function () {
  //     return {
  //       results: $scope.genres
  //     };
  //   }
  // };

  // Platform.index(function (platforms) {
  //   $scope.platforms = platforms.map(function (platform) {
  //     return {
  //       id: platform.id,
  //       text: platform.name
  //     };
  //   });
  // });

  // Genre.index(function (genres) {
  //   $scope.genres = genres.map(function (genre) {
  //     return {
  //       id: genre.id,
  //       text: genre.name
  //     };
  //   });
  // });

  $scope.success = function () {
    $location.path('/account/register/success');
  };

}]);
