'use strict';
angular.module('imvgm')
  .factory('GlobalHelpers', ['$dialog', function($dialog) {
    var _openDialog = function (templateUrl) {
      var d = $dialog.dialog();
      d.open(templateUrl, 'AuthCtrl');
    }
    return {
      login: function () {
        _openDialog('templates/dialogs/login.html');
      },
      register: function () {
        _openDialog('templates/dialogs/register.html');
      }
    }
  }
]);
