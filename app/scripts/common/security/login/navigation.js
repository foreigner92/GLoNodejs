angular.module('security.login.navigation', ['templates.common'])

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
.directive('userNavigation', ['security', '$location', function(security, $location) {
  var directive = {
    templateUrl: 'security/login/navigation.tpl.html',
    restrict: 'A',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.login = security.showLogin;
      $scope.logout = security.logout;
			$scope.account = function () {
				$location.path('/account');
			};

      $scope.$watch(function() {
        return security.currentUser;
      }, function(currentUser) {
        $scope.currentUser = currentUser;
      });

      $scope.register = function () {
        $location.path('/account/register/gamer');
      }



    }
  };
  return directive;
}]);
