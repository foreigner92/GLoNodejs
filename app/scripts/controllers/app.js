'use strict';

angular.module('imvgm')
  .controller('AppCtrl', ['$scope', '$rootScope', '$dialog', '$route', '$location', 'NetworkErrorDialog',  function($scope, $rootScope, $dialog, $route, $location, NetworkErrorDialog) {

  // Redirect to login
  var _redirectToLogin = function () {
      $location.path('/login');
  };

  // Show the network error dialog
  var _networkErrorDialog = function () {

  };

  $rootScope.$on('event:loginRequired', _redirectToLogin);
  $rootScope.$on('event:networkError', NetworkErrorDialog.show);

}]);
