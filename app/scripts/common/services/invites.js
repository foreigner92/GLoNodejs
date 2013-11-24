angular.module('services.invites', []).factory('invitesService',['$rootScope', 'config','$http', function ($rootScope, config, $http) {

	var service = {

		generateInviteCode: function () {
			return $http.post(config.api.host + '/invites/create');
		},

		sendEmailInvites: function (emailAddresses) {
			return $http.post(config.api.host + '/invites/send', {emailAddresses: emailAddresses});
		}

	};

	return service;

}]);
