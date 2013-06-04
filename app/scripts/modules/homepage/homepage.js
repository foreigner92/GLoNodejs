'use strict';
angular.module('homepage', [], ['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl:'modules/homepage/homepage.tpl.html',
    controller:'HomepageCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  });
}]);

angular.module('homepage').controller('HomepageCtrl',['$scope', 'CONFIG', function($scope, CONFIG) {
  $scope.config = CONFIG;
  // $scope.projects = projects;
}]);
