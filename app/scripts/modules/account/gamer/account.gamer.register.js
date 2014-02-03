angular.module('account.gamer.register', ['resources.platforms', 'resources.genres', 'directives.remoteForm'])
.config(['$routeProvider', function ($routeProvider) {
   $routeProvider.when('/account/register/gamer', {
    templateUrl:'modules/account/gamer/account.gamer.register.tpl.html',
    controller:'AccountGamerRegisterCtrl',
  });

	$routeProvider.when('/account/register/gamer/:inviteCode', {
    templateUrl:'modules/account/gamer/account.gamer.register.tpl.html',
    controller:'AccountGamerRegisterCtrl',
  });
}])
.controller('AccountGamerRegisterCtrl', ['$scope', '$location', 'Platform', 'Genre', '$routeParams', function ($scope, $location, Platform, Genre, $routeParams) {
  $scope.newUser = {
    role: 'gamer',
		inviteToken: $routeParams.inviteCode
  };

  $scope.navigateToGameDeveloperRegistrationForm = function () {
    // console.log('click');
    $location.path('/account/register/developer');
  };

  $scope.success = function () {
    $location.path('/account/register/success');
  };

}]);

