angular.module('directives.remoteForm', [])
.directive('remoteForm', ['$resource', 'CONFIG', 'Platform', 'Genre', '$http', '$location', function($resource, config, Platform, Genre, $http, $location) {

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

      $scope.validationErrorCode = 400;
      $scope.isSubmitted = false;

      $scope.submit = function(formData) {
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

      $http.post(config.api.host + '/auth/register', scope.formData)
        .then(
          // Callback
          function() {
            $location.path('/account/register/success');
          },
          // Errback
          function (res) {
            if (res.status === scope.validationErrorCode) {
              // Loop through API error response.

              for (var key in res.data.message) {

                if (ctrl.hasFormComponent(key)) {
                  console.log(ctrl.getFormComponent(key));
                  ctrl.getFormComponent(key).$setValidity('server', false);
                  scope.serverValidationError[key] = res.data.message[key][0];
                }
              }
            }
          }
        );

      scope.isSubmitted = false;

      })
    }
  }
}])
.directive('remoteFormComponent', function() {
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
