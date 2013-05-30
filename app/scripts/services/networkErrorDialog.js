
'use strict';
angular.module('imvgm')
  .factory('NetworkErrorDialog', ['$dialog', function($dialog) {

  console.log('NETWORK ERROR');

  var t = '<div class="modal-header">'
        + ' <h1>Network Connection Error</h1>'
        + '</div>'
        + '<div class="modal-body">'
        + '  <p>Are you connected to the internet?</p>'
        + '</div>'
        + '<div class="modal-footer">'
        + '  <button data-ng-click="close(result)" class="btn btn-primary" >Close</button>'
        + '</div>';

  var opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template: t
    // controller: 'TestDialogController'
  };

    var d = $dialog.dialog(opts);

    var _show = function () {
      if (!d.isOpen()) {
        console.log('not open')
        d.open().then(function(result){
          if(result) {
            alert('dialog closed with result: ' + result);
          }
        }, function(err) {
          console.log(err)
        });
      }
    };

    return {
      show: _show
    }
  }]);
