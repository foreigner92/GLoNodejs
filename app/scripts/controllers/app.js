'use strict';

angular.module('imvgm')
  .controller('AppCtrl', ['$scope', '$rootScope', '$dialog', '$route', '$location', function($scope, $rootScope, $dialog, $route, $location) {


  var _login = function () {

      $location.path('/login');
      // var d = $dialog.dialog();
      // d.open('templates/dialogs/login.html', 'AuthCtrl').then(function () {
      //   d.close();
      // });
  };

  // var _register = function () {
  //   var d = $dialog.dialog();
  //   d.open('templates/dialogs/register.html', 'AuthCtrl');
  // };

  // var _logout = function () {

  // };

  $rootScope.$on('event:loginRequired', _login);

  // $rootScope.$on('$routeChangeStart', function (next, current) {
  //   console.log($location.path());
  //   if ( $location.path() === '/login' ) {
  //     console.log('SHOW LOGIN DIALOG');
  //     // $rootScope.$broadcast('event:loginRequired');
  //     _login();
  //   };
  // });


//   $scope.login = _login;
//   $scope.register = _register;
// // $scope.logout = _logout;

}]);
