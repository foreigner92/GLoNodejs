'use strict';

angular.module('imvgm')
  .directive('remoteForm', ['$resource', 'apiHost', function($resource, apiHost) {

  function IllegalArgumentException (message) {
    this.message = message;
  }

  var forEach = angular.forEach,
      noop = angular.noop;

  return {
    restrict: 'A',
    scope: true,
    controller: function ($scope, $element, $attrs) {
      var self = this;

      self.formComponents = {};

      self.registerFormComponent = function(name, ngModel) {
        self.formComponents[name] = ngModel;
      };
      self.hasFormComponent = function(name) {
        return self.formComponents[name] !== undefined;
      };
      self.getFormComponent = function(name) {
        return self.formComponents[name];
      };
      self.resetFormComponentsValidity = function() {
        forEach(self.formComponents, function(component) {
          component.$setValidity('server', true);
        });
      };

      $scope.serverValidationError = {};
      $scope.target = apiHost + '/auth/register';
      $scope.method = 'post';
      $scope.validationErrorCode = 400;
      $scope.isSubmitted = false;

      $scope.register = function(formData) {
        $scope.formData = formData;
        $scope.isSubmitted = true;
        self.resetFormComponentsValidity();
      };

    },
    'link': function(scope, element, attrs, ctrl) {
      scope.$watch('isSubmitted', function(isSubmitted) {
        if (!isSubmitted) {
          return;
        }
        console.log(scope);
        var UserRegistration = $resource(scope.target);
        var newUser = new UserRegistration(scope.formData);

        newUser.$save(
          // Callback
          function() {
            if ((typeof scope[scope.success]) === 'function') {
              scope[scope.success]();
            }
          },
          // Errback
          function (res) {
            if (res.status === scope.validationErrorCode) {

              forEach(res.data.error.fields, function(item) {
                if (ctrl.hasFormComponent(item)) {
                  console.log('form has has: ' + item);

                  ctrl.getFormComponent(item).$setValidity('server', false);
                  scope.serverValidationError[item] = item;
                  console.log(ctrl.getFormComponent(item));
                }
              });
          }
        });
        scope.isSubmitted = false;
      });
    }
  }
}]).directive('remoteFormComponent', function() {
  return {
    'restrict': 'A',
    'require': ['^remoteForm', 'ngModel'],

    'link': function(scope, element, attrs, ctrls) {
      var formCtrl = ctrls[0];
      var ngModel = ctrls[1];
      console.log(attrs);
      formCtrl.registerFormComponent(attrs.name, ngModel);
    }
  }
});
