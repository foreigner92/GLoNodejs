'use strict';
angular.module('account', [], ['$routeProvider', function($routeProvider) {

  $routeProvider.when('/account', {
    templateUrl: 'modules/account/account.tpl.html',
    controller:'AccountCtrl',
  });

}]);

angular.module('account').controller('AccountCtrl',['$scope', 'CONFIG', '$location', 'security', function($scope, CONFIG, $location, security) {
  switch(security.currentUser.role) {
    case 'gamer':
      $location.path('/gamer/account');
    break;
    case 'game_developer':
      $location.path('/developer/account');
    break;
  }

  $scope.config = CONFIG;
}]);
