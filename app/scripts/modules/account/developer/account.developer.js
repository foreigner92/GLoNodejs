'use strict';
angular.module('account.developer', ['config', 'security', 'ui.bootstrap.tabs'], ['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/developer/account', {
		templateUrl:'account/developer/account.developer.tpl.html',
		controller:'DeveloperAccountCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireDeveloperRole
		}

	})
	.when('/account/settings', {redirectTo: '/developer/account/settings'})
	.when('/developer/account/settings', {
		templateUrl:'account/developer/account.developer.settings.tpl.html',
		controller: 'DeveloperAccountCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireDeveloperRole
		}
	})
	.when('/account/invites', {redirectTo: '/developer/account/invites'})
	.when('/developer/account/invites', {
		templateUrl: 'account/developer/account.developer.invites.tpl.html',
		controller: 'DeveloperAccountInvitesCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireDeveloperRole
		}
	});
}]);

angular.module('account.developer').controller('DeveloperAccountCtrl',['$scope', 'config', 'security', 'User', 'i18nNotifications', '$http', 'usersService', function($scope, config, security, User, i18nNotifications, $http, usersService) {
	$scope.config = config;
	security.requestCurrentUser()
	.then(function (user) {
		$scope.user = user;
	});;

	$scope.resetPassword = function (e) {
		$scope.passwordResetLoading = true;
		angular.element(this).attr('disabled');

		security.requestPasswordReset($scope.user.email)
		.success(function () {
			$scope.passwordResetLoading = false;
			i18nNotifications.pushForCurrentRoute('account.details.password.reset.email.sent', 'warning');
		})
		.error(function () {

		});
	};

	$scope.showFilesystemDialog = function () {
		angular.element('input[type="file"]').click();
	};

	$scope.uploadProfilePicture = function(files) {
		usersService.uploadProfilePicture($scope.user, files[0])
		.then(function () {
			security.refreshCurrentUser()
			.then(function (user) {
				$scope.user = user;
			});

		});
	};

	$scope.submit = function (userDetailsForm) {
		if (userDetailsForm.$valid) {
		var oldDetails = angular.copy(userDetailsForm);

		User.update($scope.user, function () {
			i18nNotifications.pushForCurrentRoute('account.details.updated.success', 'success');
		}, function () {

		});
		} else {
			console.log('invalid');
		}
	}
}]);

angular.module('account.developer').controller('DeveloperAccountInvitesCtrl',['$scope', 'security', function ($scope, security) {
	security.requestCurrentUser()
	.then(function (user) {
		$scope.user = user;
	});

}]);

