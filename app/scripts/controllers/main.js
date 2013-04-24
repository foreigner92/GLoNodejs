'use strict';

angular.module('imvgm')
  .controller('MainCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

  $rootScope.$on('event:loginRequired', function() {
    window.location = '/#/login';
  });

  $http({
    method: 'GET',
    url: 'http://localhost:3030/users'
  }).
  success(function(data, status, headers, config) {
    // this callback will be called asynchronously
    // when the response is available
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'];


}]);
