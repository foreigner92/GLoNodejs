'use strict';
(function (angular) {
  var imvgm = angular.module('imvgm', ['ngResource', 'ui', 'ui.bootstrap.dialog']);

  imvgm.value('apiHost', 'http://localhost:3030\:3030');
  imvgm.value('apiHostRaw', 'http://localhost:3030');
  imvgm.value('config', {
    app: {
      name: 'GloLiquid',
      version: 'alpha'
    }
  });

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
        .when('/account/verify/:token', {
          templateUrl: 'views/account/verify.html',
          controller: 'EmailVerificationCtrl',
          resolve: {
            verification: ['AuthService', '$q', '$route', function (AuthService, $q, $route) {
              var deferred = $q.defer()
                , token = $route.current.params.token;

              AuthService.verifyEmailAddress(token)
                .then(function (data) {
                  console.log(data);
                  if ( !data.error ) {
                    deferred.resolve(data);
                  } else {
                    console.log('reject');
                    deferred.reject();
                  }

                }, function (err) {

                  deferred.reject(err);
                });
              return deferred.promise;
            }]
          }
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
