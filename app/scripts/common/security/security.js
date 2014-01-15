// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'ui.bootstrap.dialog',     // Used to display the login form as a modal dialog.
  'services.i18nNotifications',
  'config',
	'templates.common'

])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$dialog', 'config', '$injector', '$cookieStore', function($http, $q, $location, queue, $dialog, config, $injector, $cookieStore) {

  var i18nNotifications = $injector.get('i18nNotifications');

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    if ( loginDialog ) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    loginDialog = $dialog.dialog();
    loginDialog.open('common/security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
  }
  function closeLoginDialog(success) {
    if (loginDialog) {
      loginDialog.close(success);
    }
  }
  function onLoginDialogClose(success) {
    // console.log(success);
		loginDialog = null;
    if ( success ) {
      queue.retryAll();
    } else {
      // queue.cancelAll();
      // redirect();
    }
  }

  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },

		closeLoginDialog: function (cb) {
			closeLoginDialog(false);
		},

    // Attempt to authenticate a user by the given email and password
    login: function(email, password) {
			return $http.post(config.api.host + '/auth/login', {email: email, password: password});
		},

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      closeLoginDialog(false);
      redirect();
    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      service.currentUser = null;
			// Delete Session Storage
      delete sessionStorage.authToken;
      delete sessionStorage.user;
			// Delete X-Auth-Token
      delete $http.defaults.headers.common['X-Auth-Token'];
			// Delete Cookies
			$cookieStore.remove('authToken');
			$cookieStore.remove('user');

      i18nNotifications.pushForNextRoute('logout.success', 'success', {}, {});
      redirect(redirectTo);

    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
				// Check cookies for goodies
				var cookieAuthTokenString = $cookieStore.get('authToken');
				if (cookieAuthTokenString) {
					$http.defaults.headers.common['X-Auth-Token'] = cookieAuthTokenString;
				}

				return this.refreshCurrentUser();
      }
    },

		refreshCurrentUser: function() {
        return $http.get(config.api.host + '/auth/current-user').then(function(response) {
          service.currentUser = response.data;
          return service.currentUser;
        }, function (err) {
          console.log(err);
        });
		},

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
      return !!service.currentUser;
    },

    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    },

    verifyEmailAddress: function (token) {
      var deferred = $q.defer();
      $http.post(config.api.host + '/auth/verify/email/' + token)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (err) {
          deferred.reject(err);
        });

      return deferred.promise;

    },

		requestPasswordReset: function (email) {
			return $http.post(config.api.host + '/auth/request_password_reset', {
				email: email
			});
		},

		resetPasswordWithToken: function (newPassword, token) {
			return $http.post(config.api.host + '/auth/reset_password', {
				password: newPassword,
				token: token
			});
		}

  };

  return service;
}]);
