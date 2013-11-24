angular.module('directives.lmDate', [])
.directive('lmDate', ['$filter', function($filter) {
  'use strict';
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelController) {
      ngModelController.$parsers.push(function(data) {
        
        console.log(data);
        return data;
      });

      ngModelController.$formatters.push(function (data) {

        console.log('filter');
        console.log(data);
        return '05/10/1982'; //data;
      });
    }
  };
}]);
