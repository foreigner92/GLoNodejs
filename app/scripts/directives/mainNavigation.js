'use strict';

angular.module('imvgm')
  .directive('mainNavigation', ['$resource', 'apiHost', 'AuthService', function($resource, apiHost, auth) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'templates/directives/mainNavigation/default.html',
      controller: function ($scope, $element, $attrs) {
      },
      'link': function (scope, element, attrs, ctrl) {
      }
    };
  }
]);
