'use strict';
angular.module('account.developer', ['config', 'security'], ['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
  $routeProvider.when('/developer/account', {
    templateUrl:'account/developer/account.developer.tpl.html',
    controller:'DeveloperAccountCtrl',
    resolve: {
      authorization: securityAuthorizationProvider.requireDeveloperRole
    }

  });
}]);

angular.module('account.developer').controller('DeveloperAccountCtrl',['$scope', 'config', 'security', function($scope, config, security) {
  $scope.config = config;
  $scope.user = security.requestCurrentUser();
}]);

