angular.module('account.gamer.register', ['resources.platforms', 'resources.genres', 'directives.remoteForm'])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/account/register/gamer', {
    templateUrl:'account/gamer/account.gamer.register.tpl.html',
    controller:'AccountGamerRegisterCtrl',
  });
}])
.controller('AccountGamerRegisterCtrl', ['$scope', '$location', 'Platform', 'Genre', function ($scope, $location, Platform, Genre) {

  $scope.newUser = {
    role: 'gamer'
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

  $scope.navigateToGameDeveloperRegistrationForm = function () {
    // console.log('click');
    $location.path('/account/register/developer');
  };

  $scope.success = function () {
    $location.path('/account/register/success');
  };

}]);

