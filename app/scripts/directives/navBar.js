'use strict';

angular.module('imvgm')
  .directive('navBar', ['$resource', 'apiHost', 'AuthService', '$dialog', '$rootScope', function($resource, apiHost, auth, $dialog, $rootScope) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'templates/directives/navBar/default.html',
      controller: function ($scope, $element, $attrs, $dialog) {
        var loggedInUserNav = [
          {
            href: '/#/account',
            name: 'My Account'
          },
          {
            href: '/#/logout',
            name: 'Logout'
          }
        ];

        var anonymousUserNav = [
          {
            href: '/#/login',
            name: 'Login'
          },
          {
            href: '/#/register',
            name: 'Register'
          }
        ]

        auth.getCurrentUser().then(function (user) {
          $scope.user = user;
        });

        if (auth.userIsLoggedIn()) {
          $scope.navUser = loggedInUserNav;
          // $element.find('.nav-user').empty().html('<li><a href="#/account">My Account</a></li><li><a href="/#/logout">Logout</a></li>');
        } else {
          $scope.navUser = anonymousUserNav;
        }
      }
    };
  }
]);
