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

  $scope.navigateToGameDeveloperRegistrationForm = function () {
    // console.log('click');
    $location.path('/account/register/developer');
  };

  $scope.success = function () {
    $location.path('/account/register/success');
  };

}]);

