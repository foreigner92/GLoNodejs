'use strict';

angular.module('imvgm')
  .controller('AccountCtrl', ['$scope', '$http', '$rootScope', '$resource', 'UsersService', 'GenresService', 'PlatformsService', function($scope, $http, $rootScope, $resource, User) {

  User.index(function (users) {
    console.log(users);
  });

}]);
