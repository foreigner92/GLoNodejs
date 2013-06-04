'use strict';
(function (angular) {

angular.module('gloliquid', [
  // 'projectsinfo',
  // 'dashboard',
  // 'projects',
  // 'admin',
  'homepage',
  'account',
  'account.gamer',
  'account.gamer.register',
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'security.login.navigation',
  'security',
  'directives.crud',
  'templates.app',
  'templates.common',
  'ngResource',
  'ui',
  'ui.bootstrap.dialog'
]);

angular.module('gloliquid').constant('CONFIG', {
  name: 'GloLiquid',
  version: 'Alpha',
  api: {
    host: 'http://localhost:3030'
  }
});

//TODO: move those messages to a separate module
angular.module('gloliquid').constant('I18N.MESSAGES', {
  'errors.route.changeError':'Route change error',
  'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
  'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
  'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
  'crud.user.save.error':"Something went wrong when saving a user...",
  'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
  'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
  'crud.project.save.error':"Something went wrong when saving a project...",
  'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
  'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
  'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
  'login.error.serverError': "There was a problem with authenticating: {{exception}}."
});

angular.module('gloliquid').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo:'/'});
}]);

angular.module('gloliquid').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);

angular.module('gloliquid').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications) {

  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });
}]);

angular.module('gloliquid').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker', 'CONFIG',
  function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker, config) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/account');
    } else {
      $location.path('/');
    }
  };

  $scope.navUser = [
    {
      name: 'item 1',
      href: 'some link'
    }
  ];

  // $scope.navUser = function () {
  //   if (!security.isAuthenticated()) {
  //     return [
  //       {
  //         name: 'Login',
  //         href: '/login'
  //       },
  //       {
  //         name: 'Register',
  //         href: '/register'
  //       }
  //     ];
  //   };
  // };

  if (!security.isAuthenticated()) {
    $scope.navUser = [
      {
        name: 'Login',
        href: '/login'
      },
      {
        name: 'Register',
        href: '/register'
      }
    ];
  }

  $scope.config = config;

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);


  // var imvgm = angular.module('imvgm', ['ngResource', 'ui', 'ui.bootstrap.dialog']);

  // imvgm.value('apiHost', 'http://localhost:3030\:3030');
  // imvgm.value('apiHostRaw', 'http://localhost:3030');
  // imvgm.value('config', {
  //   app: {
  //     name: 'GloLiquid',
  //     version: 'alpha'
  //   }
  // });

  // imvgm.config(['$routeProvider', '$httpProvider', '$locationProvider', '$dialogProvider', function($routeProvider, $http, $locationProvider, $dialog) {
  //     $routeProvider.when('/', {
  //       templateUrl: 'views/main.html',
  //       controller: 'MainCtrl'
  //     })
  //       .when('/login', {
  //           template: '<div></div>',
  //           controller: function ($dialog) {
  //             var d = $dialog.dialog({keyboard:false, backdropClick: false});
  //             d.open('templates/dialogs/login.html', 'AuthCtrl');
  //           }
  //       })
  //       .when('/logout', {
  //           templateUrl: 'views/logout.html',
  //           controller: function($location) {
  //             delete sessionStorage.authToken;
  //             delete sessionStorage.user;
  //             delete $http.defaults.headers.common['Auth-Token'];
  //             $location.path('/');
  //           }
  //       })
  //       .when('/register', {
  //           templateUrl: 'views/register.html',
  //           controller: 'AuthCtrl'
  //       })
  //       .when('/account/verify/:token', {
  //         templateUrl: 'views/account/verify.html',
  //         controller: 'EmailVerificationCtrl',
  //         resolve: {
  //           verification: ['AuthService', '$q', '$route', function (AuthService, $q, $route) {
  //             var deferred = $q.defer()
  //               , token = $route.current.params.token;

  //             AuthService.verifyEmailAddress(token)
  //               .then(function (data) {
  //                 console.log(data);
  //                 if ( !data.error ) {
  //                   deferred.resolve(data);
  //                 } else {
  //                   console.log('reject');
  //                   deferred.reject();
  //                 }

  //               }, function (err) {

  //                 deferred.reject(err);
  //               });
  //             return deferred.promise;
  //           }]
  //         }
  //       })
  //       .when('/account', {
  //         templateUrl: 'views/account.html',
  //         controller: 'AccountCtrl'
  //       })
  //       .otherwise({
  //           redirectTo: '/'
  //       });

  //   // Push response interceptor
  //   $http.responseInterceptors.push('httpInterceptor');

  //   // Check session storage for authToken
  //   var authToken = sessionStorage.getItem('authToken') || null;

  //   if (authToken) {
  //     // Set Auth-Token header
  //     $http.defaults.headers.common['Auth-Token'] = authToken;
  //   }
  // }]);
})(angular);
