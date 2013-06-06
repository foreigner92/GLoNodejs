'use strict';
angular.module('account.gamer', ['config'], ['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
  $routeProvider.when('/gamer/account', {
    templateUrl:'account/gamer/account.gamer.tpl.html',
    controller:'GamerAccountCtrl',
    resolve: {
      authorization: securityAuthorizationProvider.requireGamerRole
    }
  });
}]);

angular.module('account.gamer').controller('GamerAccountCtrl',['$scope', 'config', 'security', function($scope, config, security) {
  $scope.config = config;
  $scope.user = security.requestCurrentUser();
}]);
