angular.module('filters.fromNow', []).
	filter('fromNow', function() {
	return function(dateString) {
		return moment(dateString).fromNow();
	};
});
