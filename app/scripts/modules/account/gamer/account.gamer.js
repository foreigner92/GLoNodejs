'use strict';
angular.module('account.gamer', [], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/gamer/account', {
    templateUrl:'modules/account/gamer/account.tpl.html',
    controller:'GamerAccountCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('account.gamer').controller('GamerAccountCtrl',['$scope', 'CONFIG', function($scope, CONFIG) {
  $scope.config = CONFIG;
}]);
