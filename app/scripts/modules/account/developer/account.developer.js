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
			authorization: securityAuthorizationProvider.requireDeveloperRole,

		}
	})
	.when('/account/invites', {redirectTo: '/developer/account/invites'})
	.when('/developer/account/invites', {
		templateUrl: 'account/developer/account.developer.invites.tpl.html',
		controller: 'DeveloperAccountInvitesCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireDeveloperRole,
			invites: ['$http','security', 'config', '$q', function ($http, security, config, $q) {
				console.log('here');
				return security.requestCurrentUser()
					.then(function (user) {
						var deferred = $q.defer();

						$http.get(config.api.host + '/users/' + user.id + '/invites')
							.success(function (data) {
								deferred.resolve(data.invites);
							})
							.error(function (err) {
								deferred.reject(err);
							});

							return deferred.promise;
					});
				}]
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

angular.module('account.developer').controller('DeveloperAccountInvitesCtrl',['$q','$scope', 'security','config','$http', 'invites', function ($q, $scope, security, config, $http, invites) {

	$q.when(invites).then(function (invites) {
		$scope.invites = invites;
	});


	security.requestCurrentUser()
	.then(function (user) {
		$scope.user = user;
	});

	$scope.generateInviteCode = function() {
		$http.post(config.api.host + '/invites/create')
			.success(function (invite) {
				console.log(invite);
			})
			.error(function (err) {
				console.log(err);
			});
	};

}]);


