'use strict';
angular.module('account.gamer', ['config'], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gamer/account', {
    templateUrl:'account/gamer/account.gamer.tpl.html',
    controller:'GamerAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('account.gamer').controller('GamerAccountCtrl',['$scope', 'config', 'security', function($scope, config, security) {
  $scope.config = config;
  $scope.user = security.requestCurrentUser();
}]);
