'use strict';

describe('Service: AuthService:', function() {
  // load the module
  beforeEach(module('imvgm'));

  var AuthService;
  var mockResponseData;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($httpBackend) {
    mockResponseData = {
      'authToken': 'authtoken',
      'user': {
        'id': 1,
        'username': 'test_user'
      }
    };
    $httpBackend.whenPOST('http://localhost:3030/auth/login').respond(function (method, url, data) {
      if (data.username === mockResponseData.user.username && data.username === mockResponseData.user.username) {
        return [200, mockResponseData];
      } else {
        return [401, {}, {}];
      }
    });
  }));

  describe('login():', function () {
    describe('valid credentials', function () {
      it('should call callback with with response data', inject(function (AuthService) {
        AuthService.login('test_user', 'test_password')
          .then(function (data) {
            expect(data).toEqual(mockResponseData);
          });
      }));
    });

    describe('invalid credentials', function () {
      beforeEach(inject(function (AuthService) {
        this.mock = {
          errback: function () {

          },
          callback: function () {

          }
        };

      // it('should call errback', inject(function (AuthService, $q) {

      //   AuthService.login('test_user', 'wrong_password')
      //     .then(null, function () {
      //       deferred.resolve();
      //     });
      //     return deferre.promise.then(function () {

      //     }, function (){
      //       deferred.reject()
      //     })
      //   }));

      // }));
    });
  });

  // describe('register():', function () {
  //   it('should register a new user', inject(function (AuthService) {
  //     AuthService.register({
  //       fullname: 'full name',
  //       username: 'username',
  //       password: 'password',
  //       gender: 'male',
  //       dob: '05/10/1982',
  //       country: 'UK',
  //       owned: [],
  //       play: []
  //     })
  //       .then(function () {
  //         expect(this).toHaveBeenCalled();
  //       });
  //   }));
  // });



});
