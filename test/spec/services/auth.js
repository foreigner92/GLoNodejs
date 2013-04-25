'use strict';

describe('Service: AuthService', function() {

  // load the controller's module
  beforeEach(module('imvgm'));

  var AuthService
    , scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($factory, $rootScope) {
    AuthService = $factory('AuthService');
  }));

  it('should attach a list of awesomeThings to the scope', function() {
    // expect(scope.awesomeThings.length).toBe(3);
  });
});
