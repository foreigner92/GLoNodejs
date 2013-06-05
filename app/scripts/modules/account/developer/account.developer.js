'use strict';
angular.module('account.developer', [], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/developer/account', {
    templateUrl:'modules/account/developer/account.developer.tpl.html',
    controller:'DeveloperAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('account.developer').controller('DeveloperAccountCtrl',['$scope', 'CONFIG', 'security', function($scope, CONFIG, security) {
  $scope.config = CONFIG;
  $scope.user = security.requestCurrentUser();
}]);

