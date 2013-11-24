angular.module('services.users', []).factory('usersService', ['$rootScope', '$upload', 'config', '$q', function ($rootScope, $upload, config, $q) {


  var service = {};

	service.uploadProfilePicture = function (user, $files) {
		var defer = $q.defer();

		$upload.upload({
			url: config.api.host + '/users/' + user.id + '/profile_picture',
			fileFormDataName: 'profilePicture',
			file: $files
		}).success(function () {
			defer.resolve();
		}).error(function (err) {
			defer.reject(err);
		});

		return defer.promise;
	}

  return service;
}]);

