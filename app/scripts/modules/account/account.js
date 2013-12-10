'use strict';
angular.module('account', ['config', 'security', 'services.invites', 'ngRoute', 'templates.app'], ['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {

  $routeProvider.when('/account', {
    templateUrl: 'account/account.tpl.html',
    controller:'AccountCtrl',
    resolve: {
      authorization: securityAuthorizationProvider.requireAuthenticatedUser
    }
  })
  .when('/account/register/success', {
    templateUrl: 'account/account.register.success.tpl.html',
    controller:'AccountCtrl'
  })
	.when('/account/login/:inviteCode', {
		controller: ['security', function (security) {
			security.showLogin();
		}]
	})
  .when('/account/verify/:token', {
    templateUrl: 'account/account.emailVerification.tpl.html',
    controller: 'AccountEmailVerificationCtrl',
    resolve: {
      verification: ['security', '$q', '$route', function (security, $q, $route) {
        var deferred = $q.defer()
          , token = $route.current.params.token;

        security.verifyEmailAddress(token)
          .then(function (data) {
            console.log(data);
            if ( !data.error ) {
              deferred.resolve(data);
            } else {
              console.log('reject');
              deferred.reject();
            }

          }, function (err) {
            console.log(err);
            deferred.resolve(err);
          });
        return deferred.promise;
      }]
    }
  })
	.when('/account/password/reset', {
		templateUrl: 'account/account.resetPassword.tpl.html',
		controller: 'AccountPasswordResetCtrl'
	})
	.when('/account/password/reset/:token', {
		templateUrl: 'account/account.resetPassword.tpl.html',
		controller: 'AccountPasswordResetCtrl',
		// resolve: {
		// verification: ['security', '$q', '$route', function (security, $q, $route) {
		//   var deferred = $q.defer()
		//     , token = $route.current.params.token;

		//   security.verifyPasswordResetToken(token)
		//     .then(function (data) {
		//       if ( !data.error ) {
		//         deferred.resolve(data);
		//       } else {
		//         deferred.reject();
		//       }
		//     }, function (err) {
		//       deferred.resolve(err);
		//     });
		//   return deferred.promise;
		// }]
		// }
	});

}]);

angular.module('account')
.controller('AccountCtrl',['$scope', 'config', '$location', 'security', 'i18nNotifications', function($scope, config, $location, security, i18nNotifications) {

  switch(security.currentUser.role) {
    case 'gamer':
      $location.path('/gamer/account');
    break;
    case 'game_developer':
      $location.path('/developer/account');
    break;
  };

  $scope.config = config;

}])
.controller('AccountEmailVerificationCtrl', ['$scope', 'config', '$location', 'security', 'i18nNotifications', 'verification', function($scope, config, $location, security, i18nNotifications, verification) {
  $scope.showLogin = security.showLogin;

  $scope.validated = true;
  if (verification.code && verification.code === 'InvalidContent') {
    $scope.validated = false;
  }

}])
.controller('AccountPasswordResetCtrl', ['$scope', 'config', '$location', 'security', 'i18nNotifications', '$route', function($scope, config, $location, security, i18nNotifications, $route) {

	$scope.showLogin = security.showLogin;
	$scope.resetToken = $route.current.params.token || false;

	if ($scope.resetToken) {
		// We have a reset Token
		$scope.resetPassword = function () {

			if (!$scope.user) {
				$scope.error = {
					'title': 'Error.',
					'msg': 'Please enter your new password.'
				};
				return;
			}

			if ($scope.user.password != $scope.user.password_confirm) {
				// Passwords don't match.
				$scope.error = {
					'title': 'Passwords don\'t match.',
					'msg': 'The passwords you entered do not match'
				};
				return;
			}

			security.resetPasswordWithToken($scope.user.password, $scope.resetToken)
				.success(function () {
					$scope.success = true;
				})
				.error(function (err) {
					if (err.code === 'InvalidContent' && err.message === 'InvalidToken') {
						$scope.error = {
							title: 'Invalid Token',
							msg: 'The password reset token you\'re attempting to use isn\'t valid or may have expired.'
						};
					}
				});

		};

	} else {

		$scope.sendPasswordResetEmail = function () {
			if ($scope.user && $scope.user.email) {
				security.requestPasswordReset($scope.user.email)
					.success(function () {
						$scope.emailSent = true;
					})
					.error(function () {
						// Error out
					});
			}
		};

	}

}]).directive('emailInvites', [function () {

	var directive = {
		restrict: 'E',
		templateUrl: 'scripts/modules/account/account.emailInvites.tpl.html',
		scope: {
			invites: '='
		},
		controller: ['$scope', '$element', '$attrs', 'invitesService','$timeout','security', function ($scope, $element, $attrs, invitesService, $timeout, security) {
			$scope.emailAddresses = [];
			$scope.send = function () {

				var emailAddresses = $scope.emailAddresses.map(function (item) {
					return item.text;
				});


					// $element.find('input[type=hidden]').val() !="" ? $element.find('input[type=hidden]').val().split(',') : undefined;


				if (emailAddresses) {
					invitesService.sendEmailInvites(emailAddresses)
						.success(function (invites) {
							var inviteArr = [];
							invites.forEach(function (invite) {
								$scope.invites.unshift(invite);
							});

							$scope.emailAddresses = [];

							security.requestCurrentUser()
								.then(function (currentUser) {
								currentUser.inviteCount = currentUser.inviteCount - invites.length;
							});
						})
						.error(function (err) {
							console.log(err);
						});
				}
			};
		}]
	};

	return directive;

}]).directive('inviteHistory', [function () {
	var directive = {
		restrict: 'E',
		templateUrl: 'scripts/modules/account/account.inviteHistory.tpl.html',
		scope: {
			invites: '='
		},
		controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
				$timeout(function () {
					$scope.$apply();
				}, 60000);

				$scope.$watch('invites', function (invites) {
					console.log('WATCH');
					console.log($scope.invites);
					// $scope.$apply();
				});


		}]

	};

	return directive;
}]).directive('activeInvites', ['invitesService', function(invitesService) {
	var directive = {
		restrict: 'E',
		templateUrl: 'scripts/modules/account/account.activeInvites.tpl.html',
		scope: {
			invites: '='
		},
		controller: ['$scope', '$element', '$attrs', 'security', '$timeout', function ($scope, $element, $attrs, security, $timeout) {


			$scope.generateInviteCode = function () {
				invitesService.generateInviteCode()
					.success(function (invite) {
						$scope.invites.unshift(invite);
						security.requestCurrentUser()
							.then(function (currentUser) {
								currentUser.inviteCount--;
							});

					})
					.error(function (err) {
						console.log(err);
					});
			};

			$scope.showPendingInvites = function (item) {
				return (item.status === 'pending');
			};

			// Wait a second for the ng-repet to finish
			// TODO: refactor as a directive
			$timeout(function () {
				console.log('timeout');
			console.log($element.find('.copy-top-clipboard'));
			var clip = new ZeroClipboard($element.find('.copy-to-clipboard'),{
				moviePath: '/components/zeroclipboard/ZeroClipboard.swf'
			});

			clip.on( "load", function(client) {
				// alert( "movie is loaded" );

				client.on( "complete", function(client, args) {
					// `this` is the element that was clicked
					alert("Copied text to clipboard: " + args.text );
				} );
			} );

			}, 1000);

			$scope.copyToClipboard = function (token) {
				// clip.setText(token);
			};
		}]
	};

	return directive;
}]);
