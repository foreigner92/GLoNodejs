'use strict';

angular.module('imvgm')
  .controller('MainCtrl', ['$scope', '$http', '$rootScope', '$resource', 'UsersService', function($scope, $http, $rootScope, $resource, User) {

  $rootScope.$on('event:loginRequired', function() {
    window.location = '/#/login';
  });

  var user = User.index(function (users) {
    // console.log(users);
  })

  // var authToken = sessionStorage.getItem('authToken');
  // if (!authToken) {
  //   $rootScope.$broadcast('event:loginRequired');
  // }

    // .get();
    // .success(function(data, status, headers, config) {
    // // this callback will be called asynchronously
    // // when the response is available
    // })
    // .error(function(data, status, headers, config) {
    // // called asynchronously if an error occurs
    // // or server returns response with an error status.
    // });

  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'];


}]);
