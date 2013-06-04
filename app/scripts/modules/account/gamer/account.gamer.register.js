angular.module('account.gamer.register', [])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/account/gamer/register', {
    templateUrl:'modules/account/gamer/account.gamer.register.tpl.html',
    controller:'AccountGamerRegisterCtrl',
    // resolve:{
    //   projects:['Projects', function(Projects){
    //     return Projects.all();
    //   }]
    // }
  })
}])
.controller('AccountGamerRegisterCtrl', ['$scope', 'security', 'localizedMessages', function($scope, security, localizedMessages) {
  // The model for this form
}]);


