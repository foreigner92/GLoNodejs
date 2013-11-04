'use strict';
(function (angular) {

angular.module('app', [
  // Modules
  'homepage',
  'account',
  'account.gamer',
  'account.gamer.register',
  'account.developer',
  'account.developer.register',

  // Common
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
	'services.users',
	'services.invites',
  'security.login.navigation',
  'security',
  'directives.crud',
	'filters.fromNow',

  // Resources
  'resources.platforms',
  'resources.genres',
  'resources.users',

  // Templates
  'templates.app',
  'templates.common',

  // config
  'config',

  // Vendor
	'angulartics',
	'angulartics.google.analytics',
  'ngResource',
	'ngCookies',
  'ui',
  'ui.bootstrap.dialog',
	'ui.bootstrap.dropdownToggle',
	'ui.bootstrap.tooltip',
	'ui.bootstrap.tabs',
	'angularFileUpload',
	'chieffancypants.loadingBar',
	'ngAnimate'
]);

//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
  'errors.route.changeError':'Route change error',
  'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
  'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
  'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
  'crud.user.save.error':"Something went wrong when trying to save a user...",
  'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
  'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
  'crud.project.save.error':"Something went wrong when saving a project...",
  'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
  'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
  'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
	'login.error.emailVerificationIncomplete': 'You must verify your email address before you can access the system',
  'login.error.serverError': "There was a problem with authenticating: {{exception}}.",
  'login.success': 'You have successfully logged in.',
  'logout.success': 'You have successfully logged out of your account.',
	'account.details.password.reset.email.sent': 'We\'ve sent an email to your registered email account.  Check your inbox for further instructions',
	'account.details.updated.success': 'Account details succesfully updated'
});

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo:'/'});
}]);

angular.module('app').run(['security', '$http', '$cookieStore', function(security, $http, $cookieStore) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  var authTokenString = $cookieStore.get('authToken');
  if (authTokenString) {
    $http.defaults.headers.common['X-Auth-Token'] = authTokenString;
    security.requestCurrentUser();
  }

}]);

angular.module('app').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications) {

  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });
}]);

angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker', 'config',
  function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker, config) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
		$location.path('/');
  };

  // if (!security.isAuthenticated()) {
  //   $scope.navUser = [
  //     {
  //       name: 'Login',
  //       href: '/login'
  //     },
  //     {
  //       name: 'Register',
  //       href: '/register'
  //     }
  //   ];
  // }

  $scope.config = config;

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);


})(angular);
