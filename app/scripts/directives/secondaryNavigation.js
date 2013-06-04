'use strict';

angular.module('imvgm')
  .directive('secondaryNavigation', ['$resource', 'apiHost', 'AuthService', function($resource, apiHost, auth) {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'templates/directives/secondaryNavigation/default.html',
      controller: function ($scope, $element, $attrs) {
      },
      'link': function (scope, element, attrs, ctrl) {
      }
    };
  }
]);
