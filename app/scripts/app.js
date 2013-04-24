'use strict';

angular.module('imvgm', ['ngResource'])
  .config(['$routeProvider', '$httpProvider', function($routeProvider, $http) {
  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  })
    .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'AuthCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });

  // Push response interceptor
  $http.responseInterceptors.push('httpInterceptor');

  // Check session storage for authToken
  var authToken = sessionStorage.getItem('authToken') || null;

  if (authToken) {
    // Set Auth-Token header
    $http.defaults.headers.common['Auth-Token'] = authToken;
  }
}]);
