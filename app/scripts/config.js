angular.module('config', []);
angular.module('config').constant('config', {
  name: 'TastemakerTools',
  version: '1.0',
  api: {
    host: (function () {
			if (location.href.match(/localhost/).length) {
				return 'http://localhost:3030';
			} else {
				return 'http://tm-app-staging.cloudapp.net:3030/';
			}
		}())
  }
});
