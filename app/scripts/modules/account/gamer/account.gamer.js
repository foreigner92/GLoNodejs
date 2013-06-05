'use strict';
angular.module('account.gamer', [], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gamer/account', {
    templateUrl:'modules/account/gamer/account.gamer.tpl.html',
    controller:'GamerAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('account.gamer').controller('GamerAccountCtrl',['$scope', 'CONFIG', 'security', function($scope, CONFIG, security) {
  $scope.config = CONFIG;
  $scope.user = security.requestCurrentUser();
}]);
