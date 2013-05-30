'use strict';

angular.module('imvgm')
  .directive('registrationForm', ['$resource', 'apiHost', 'AuthService', 'PlatformsService', 'GenresService', function($resource, apiHost, auth, Platform, Genre) {

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

      $scope.platformSelectOptions = {
        data: function () {
          return {
            results: $scope.platforms
          };
        }
      };

      $scope.genresSelectOptions = {
        data: function () {
          return {
            results: $scope.genres
          };
        }
      };

      Platform.index(function (platforms) {
        $scope.platforms = platforms.map(function (platform) {
          return {
            id: platform.id,
            text: platform.name
          };
        });
      });

      Genre.index(function (genres) {
        $scope.genres = genres.map(function (genre) {
          return {
            id: genre.id,
            text: genre.name
          };
        });
      });


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

      auth.register(scope.formData)
        .then(
          // Callback
          function() {
            if ((typeof scope[scope.success]) === 'function') {
              scope[scope.success]();
            }
          },
          // Errback
          function (res) {
            console.log(res.status === scope.validationErrorCode);
            if (res.status === scope.validationErrorCode) {
              // Loop through API error response.
              for (var key in res.data.error.fields) {
                console.log(key);
                if (ctrl.hasFormComponent(key)) {
                  console.log(ctrl.getFormComponent(key));
                  ctrl.getFormComponent(key).$setValidity('server', false);
                  scope.serverValidationError[key] = res.data.error.fields[key][0];
                }
              }
            }
          }
        );

      scope.isSubmitted = false;

      })
    }
  }
}]
).directive('registrationFormComponent', function() {
  return {
    'restrict': 'A',
    'require': ['^registrationForm', 'ngModel'],

    'link': function(scope, element, attrs, ctrls) {
      var formCtrl = ctrls[0];
      var ngModel = ctrls[1];
      console.log(attrs);
      formCtrl.registerFormComponent(attrs.name, ngModel);
    }
  }
});
