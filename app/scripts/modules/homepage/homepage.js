'use strict';
angular.module('homepage', ['config', 'ngRoute', 'templates.app'], ['$routeProvider', function($routeProvider) {
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

angular.module('homepage').controller('HomepageCtrl',['$scope', 'config', function($scope, config) {
  $scope.config = config;
  // $scope.projects = projects;
}]);
