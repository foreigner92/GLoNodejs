'use strict';
angular.module('account', [], ['$routeProvider', function($routeProvider) {

  $routeProvider.when('/account', {
    templateUrl: 'modules/account/account.tpl.html',
    controller:'AccountCtrl'
  })
  .when('/account/register/success', {
    templateUrl: 'modules/account/account.register.success.tpl.html',
    controller:'AccountCtrl'
  })
  .when('/account/verify/:token', {
    templateUrl: 'modules/account/account.emailVerification.tpl.html',
    controller: 'AccountEmailVerificationCtrl',
    resolve: {
      verification: ['security', '$q', '$route', function (security, $q, $route) {
        var deferred = $q.defer()
          , token = $route.current.params.token;

        security.verifyEmailAddress(token)
          .then(function (data) {
            console.log(data);
            if ( !data.error ) {
              deferred.resolve(data);
            } else {
              console.log('reject');
              deferred.reject();
            }

          }, function (err) {
            console.log(err);
            deferred.resolve(err);
          });
        return deferred.promise;
      }]
    }
  });

}]);

angular.module('account')
.controller('AccountCtrl',['$scope', 'CONFIG', '$location', 'security', 'i18nNotifications', function($scope, CONFIG, $location, security, i18nNotifications) {

  switch(security.currentUser.role) {
    case 'gamer':
      $location.path('/gamer/account');
    break;
    case 'game_developer':
      $location.path('/developer/account');
    break;
  };

  $scope.config = CONFIG;

}])
.controller('AccountEmailVerificationCtrl', ['$scope', 'CONFIG', '$location', 'security', 'i18nNotifications', 'verification', function($scope, CONFIG, $location, security, i18nNotifications, verification) {
  $scope.showLogin = security.showLogin;

  $scope.validated = true;
  if (verification.code && verification.code === 'InvalidContent') {
    $scope.validated = false;
  }

}]);
