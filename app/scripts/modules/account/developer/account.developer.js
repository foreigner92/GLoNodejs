'use strict';
angular.module('account.developer', [], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/developer/account', {
    templateUrl:'modules/account/developer/account.tpl.html',
    controller:'DeveloperAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('account.developer').controller('DeveloperAccountCtrl',['$scope', 'CONFIG', function($scope, CONFIG) {
  $scope.config = CONFIG;
}]);
