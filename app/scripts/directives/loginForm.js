'use strict';

angular.module('imvgm')
  .directive('loginForm', ['$resource', 'apiHost', 'AuthService', '$http', function($resource, apiHost, auth, $http) {

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
      $scope.target = apiHost + '/auth/login';
      $scope.method = 'post';
      $scope.validationErrorCode = 400;
      $scope.isSubmitted = false;

      $scope.submit = function(formData) {
        console.log('submit');
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

      var username = scope.formData ? scope.formData.username : '';
      var password = scope.formData ? scope.formData.password : '';

      auth.login(username, password)
        .then(
          // Callback
          function(data) {

            console.log('authenticated');
          // Set Auth-Token header
          $http.defaults.headers.common['Auth-Token'] = data.user.username + ':' + data['auth-token'];

          // Store authToken and userId in sessionStorage
          sessionStorage.setItem('authToken', data.user.username + ':' + data['auth-token']);
          sessionStorage.setItem('user', JSON.stringify(data.user));

          location.href = "#/account";
          },
          // Errback
          function (err) {
            if (err.code === 'InvalidContent') {
              ctrl.getFormComponent('username').$setValidity('server', false);
            }
          }
        );

      scope.isSubmitted = false;

      })
    }
  }
}]
).directive('remoteFormComponent', function() {
  return {
    'restrict': 'A',
    'require': ['^loginForm', 'ngModel'],

    'link': function(scope, element, attrs, ctrls) {
      var formCtrl = ctrls[0];
      var ngModel = ctrls[1];
      console.log(attrs);
      formCtrl.registerFormComponent(attrs.name, ngModel);
    }
  }
});
