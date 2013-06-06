'use strict';
angular.module('account.developer', ['config'], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/developer/account', {
    templateUrl:'account/developer/account.developer.tpl.html',
    controller:'DeveloperAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }

  });
}]);

angular.module('account.developer').controller('DeveloperAccountCtrl',['$scope', 'config', 'security', function($scope, config, security) {
  $scope.config = config;
  $scope.user = security.requestCurrentUser();
}]);

