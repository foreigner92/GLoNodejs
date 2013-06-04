angular.module('account.gamer.register', ['resources.platforms', 'resources.genres'])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/account/gamer/register', {
    templateUrl:'modules/account/gamer/account.gamer.register.tpl.html',
    controller:'AccountGamerRegisterCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  })
}])
.controller('AccountGamerRegisterCtrl', [function () {

}])
.directive('registrationForm', ['$resource', 'CONFIG', 'Platform', 'Genre', '$http', function($resource, config, Platform, Genre, $http) {

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

      $http.post(config.api.host + '/auth/register', scope.formData)
        .then(
          // Callback
          function() {
            if ((typeof scope[scope.success]) === 'function') {
              scope[scope.success]();
            }
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
// .controller('AccountGamerRegisterCtrl', ['$scope', 'security', 'localizedMessages', 'Platform', 'Genre', '$http', 'CONFIG', function($scope, security, localizedMessages, Platform, Genre, $http, config) {
//   var self = this
//     , forEach = angular.forEach
//     , noop = angular.noop;

//   self.formComponents = {};

//   self.registerFormComponent = function(name, ngModel) {
//     self.formComponents[name] = ngModel;
//   };
//   self.hasFormComponent = function(name) {
//     return self.formComponents[name] !== undefined;
//   };
//   self.getFormComponent = function(name) {
//     return self.formComponents[name];
//   };
//   self.resetFormComponentsValidity = function() {
//     forEach(self.formComponents, function(component) {
//       component.$setValidity('server', true);
//     });
//   };

//   $scope.serverValidationError = {};
//   $scope.method = 'post';
//   $scope.validationErrorCode = 400;
//   $scope.isSubmitted = false;

//   $scope.platformSelectOptions = {
//     data: function () {
//       return {
//         results: $scope.platforms
//       };
//     }
//   };

//   $scope.genresSelectOptions = {
//     data: function () {
//       return {
//         results: $scope.genres
//       };
//     }
//   };

//   Platform.index(function (platforms) {
//     $scope.platforms = platforms.map(function (platform) {
//       return {
//         id: platform.id,
//         text: platform.name
//       };
//     });
//   });

//   Genre.index(function (genres) {
//     $scope.genres = genres.map(function (genre) {
//       return {
//         id: genre.id,
//         text: genre.name
//       };
//     });
//   });

//   $scope.submit = function(formData) {
//     $scope.formData = formData;
//     $scope.isSubmitted = true;
//     self.resetFormComponentsValidity();
//   };

//   $scope.$watch('isSubmitted', function(isSubmitted) {
//     if (!isSubmitted) {
//       return;
//     }

//     $http.post(config.api.host + '/auth/register', $scope.formData)
//       .then(
//         // Callback
//         function() {
//           if ((typeof $scope[scope.success]) === 'function') {
//             $scope[scope.success]();
//           }
//         },
//         // Errback
//         function (res) {
//           if (res.status === $scope.validationErrorCode) {
//             // Loop through API error response.
//             for (var key in res.data.message) {
//               if (self.hasFormComponent(key)) {
//                 console.log(ctrl.getFormComponent(key));
//                 self.getFormComponent(key).$setValidity('server', false);
//                 $scope.serverValidationError[key] = res.data.message[key][0];
//               }
//             }
//           }
//         }
//       );

//     $scope.isSubmitted = false;

//   });

// }])
.directive('registrationFormComponent', function() {
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
