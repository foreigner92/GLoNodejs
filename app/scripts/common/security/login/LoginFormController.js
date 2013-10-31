angular.module('security.login.form', ['services.localizedMessages',
							 'services.i18nNotifications'])

							 // The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
							 // This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
							 .controller('LoginFormController', ['$scope', 'security', 'localizedMessages', '$window', '$http', '$cookieStore', function($scope, security, localizedMessages, $window, $http, $cookieStore) {
								 // The model for this form
								 $scope.user = {};

								 // Any error message from failing to login
								 $scope.authError = null;

								 // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
								 // We could do something diffent for each reason here but to keep it simple...
								 $scope.authReason = null;
								 if ( security.getLoginReason() ) {
									 $scope.authReason = ( security.isAuthenticated() ) ?
										 localizedMessages.get('login.reason.notAuthorized') :
										 localizedMessages.get('login.reason.notAuthenticated');
								 }

								 // Attempt to authenticate the user specified in the form's model
								 $scope.login = function() {
									 // Clear any previous security errors
									 $scope.authError = null;
									 console.log($scope.user.rememberLogin);

									 // Try to login
									 security.login($scope.user.email, $scope.user.password)
									 .success(function(response) {
										 var authTokenString = response.user.email + ':' + response['auth-token'];
										 $http.defaults.headers.common['X-Auth-Token'] = authTokenString;


										 console.log(response);
										 console.log('callback');
										 // security.currentUser = response.user;
										 security.requestCurrentUser()
											.then(function (user) {
												var stringifiedUser = JSON.stringify(user);
												if ($scope.user.rememberLogin) {
													$cookieStore.put('authToken', authTokenString);
													$cookieStore.put('user', stringifiedUser);
												}

												// Store authToken and userId in sessionStorage
												sessionStorage.setItem('authToken', authTokenString);
												sessionStorage.setItem('user', stringifiedUser);

												// Set Auth-Token Header
												$http.defaults.headers.common['X-Auth-Token'] = authTokenString;

												if ( security.isAuthenticated() ) {
													$window.location.href = '/#/account';
													security.closeLoginDialog();
												} else {
													console.log('not authenticated');
												}
											});

									 }).error(function (error) {

										 if (error && error.message === 'EmailVerificationIncomplete') {
											 $scope.authError = localizedMessages.get('login.error.emailVerificationIncomplete');
										 } else {
											 $scope.authError = localizedMessages.get('login.error.invalidCredentials');
										 }
									 });


								 };

								 $scope.resetPassword = function () {
									 console.log('reset the password');
										$window.location.href = '/#/account/password/reset';
								 }

								 $scope.clearForm = function() {
									 user = {};
								 };

								 $scope.cancelLogin = function() {
									 security.cancelLogin();
								 };
							 }]);
