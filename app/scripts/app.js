'use strict';
(function (angular) {
  var imvgm = angular.module('imvgm', ['ngResource', 'ui', 'ui.bootstrap.dialog']);
  imvgm.value('apiHost', 'http://localhost:3030\:3030');
  imvgm.config(['$routeProvider', '$httpProvider', '$locationProvider', '$dialogProvider', function($routeProvider, $http, $locationProvider, $dialog) {
      $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
        .when('/login', {
            template: '<div></div>',
            controller: function ($dialog) {
              var d = $dialog.dialog({keyboard:false, backdropClick: false});
              d.open('templates/dialogs/login.html', 'AuthCtrl');
            }
        })
        .when('/logout', {
            templateUrl: 'views/logout.html',
            controller: function($location) {
              delete sessionStorage.authToken;
              delete sessionStorage.user;
              delete $http.defaults.headers.common['Auth-Token'];
              $location.path('/');
            }
        })
        .when('/register', {
            templateUrl: 'views/register.html',
            controller: 'AuthCtrl'
        })
        .when('/account', {
          templateUrl: 'views/account.html',
          controller: 'AccountCtrl'
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
