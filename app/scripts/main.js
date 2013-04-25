// /**
//  *
//  */
// require.config({
//   paths: {
//     jquery: '../components/jquery/jquery',
//     angular: '../components/angular/angular',
//     // text: 'lib/require/text'
//   },
//   baseUrl: '/scripts',
//   shim: {
//     'angular' : {'exports' : 'angular'},
//     'angularMocks': {deps:['angular'], 'exports':'angular.mock'}
//   },
//   priority: [
//     "angular"
//   ]
// });

// require( [
//   'jquery',
//   'angular',
//   'app',
//   'controllers/main'
// ], function($, angular, app) {
//   'use strict';

//   $(document).ready(function () {
//     var $html = $('html');
//     angular.bootstrap($html, [app['name']]);
//     // Because of RequireJS we need to bootstrap the app app manually
//     // and Angular Scenario runner won't be able to communicate with our app
//     // unless we explicitely mark the container as app holder
//     // More info: https://groups.google.com/forum/#!msg/angular/yslVnZh9Yjk/MLi3VGXZLeMJ
//     $html.addClass('ng-app');
//   });
// });


// // require([
// //     'components/angular/angular.js',
// //     'components/angular-resource/angular-resource.js',
// //     'components/angular-cookies/angular-cookies.js',
// //     'components/angular-sanitize/angular-sanitize.js',
// //     'scripts/app.js',
// //   ], function() {

// //   }
// // );
