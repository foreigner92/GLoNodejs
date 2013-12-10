'use strict';
angular.module('account.gamer', ['config', 'templates.app'], ['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
  $routeProvider.when('/gamer/account', {
    templateUrl:'account/gamer/account.gamer.tpl.html',
    controller:'GamerAccountCtrl',
    resolve: {
      authorization: securityAuthorizationProvider.requireGamerRole
    }
  })
	.when('/gamer/account/settings', {
		templateUrl:'account/gamer/account.gamer.settings.tpl.html',
		controller: 'GamerAccountCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireGamerRole
		}
	})
	.when('/gamer/account/invites', {
		templateUrl: 'account/gamer/account.gamer.invites.tpl.html',
		controller: 'GamerAccountInvitesCtrl',
		resolve: {
			authorization: securityAuthorizationProvider.requireGamerRole,
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
;
}]);

angular.module('account.gamer').controller('GamerAccountCtrl',['$scope', 'config', 'security', 'User', 'i18nNotifications', '$http', 'usersService', function($scope, config, security, User, i18nNotifications, $http, usersService) {
	$scope.config = config;
	security.requestCurrentUser()
	.then(function (user) {
		$scope.user = user;
	});;

	$scope.updateAccountSettings = function () {
		$scope.updateAccountSettingsLoading = true;
	};

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
			security.requestCurrentUser()
			.then(function (user) {
				$scope.user = user;
				console.log($scope.user.profilePicture);
				// $scope.$digest();
			});;

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

angular.module('account.gamer').controller('GamerAccountInvitesCtrl',['$q','$scope', 'security','config','$http', 'invites', 'invitesService', function ($q, $scope, security, config, $http, invites, invitesService) {

	$q.when(invites).then(function (invites) {
		$scope.invites = invites;
	});


	security.requestCurrentUser()
	.then(function (user) {
		$scope.user = user;
	});

	$scope.generateInviteCode = function() {
		invitesService.generateInviteCode()
			.success(function () {

			})
			.error(function () {
			});
	};

}]);


