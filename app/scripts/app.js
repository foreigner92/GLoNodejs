'use strict';
(function (angular) {
  var imvgm = angular.module('imvgm', ['ngResource', 'ui']);
  imvgm.value('apiHost', 'http://localhost:3030\:3030');
  imvgm.config(['$routeProvider', '$httpProvider', '$locationProvider', function($routeProvider, $http, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthCtrl'
        })
        .when('/logout', {
            templateUrl: 'views/logout.html',
            controller: function() {
              delete sessionStorage.authToken;
              delete sessionStorage.userId;
              delete $http.defaults.headers.common['Auth-Token'];
              $location.path = '#/';
            }
        })
        .when('/register', {
          templateUrl: 'views/register.html',
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
})(angular);
