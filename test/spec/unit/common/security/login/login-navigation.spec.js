describe('login-navigation', function() {
  var $rootScope, scope, userNav, security;
  angular.module('test', []).value('I18N.MESSAGES', {});
  beforeEach(module('security/login/navigation.tpl.html', 'security', 'test'));

  beforeEach(inject(function(_$rootScope_, $compile, _security_) {
    $rootScope = _$rootScope_;
    security = _security_;
    userNav = $compile('<div data-user-navigation=""></div>')($rootScope);
    $rootScope.$digest();
    scope = userNav.scope();
    angular.element(document.body).append(userNav);
  }));

  afterEach(function() {
    userNav.remove();
  });

  it('should attach stuff to the scope', inject(function ($compile, $rootScope) {
    expect(scope.currentUser).toBeDefined();
    expect(scope.isAuthenticated).toBe(security.isAuthenticated);
    expect(scope.login).toBe(security.showLogin);
    expect(scope.logout).toBe(security.logout);
  }));

  it('should display a link with the current user name, when authenticated', function () {
    security.currentUser = { username: 'Jo Bloggs'};
    $rootScope.$digest();
    expect(userNav.find('a').text()).toBe('Jo Bloggs');
  });

  it('should not display a link with the current user name, when not authenticated', function () {
    security.currentUser = null;
    $rootScope.$digest();
    expect(userNav.find('a').is(':visible')).toBe(false);
  });

  it('should display login when user is not authenticated', function() {
    expect(userNav.find('button:visible').text()).toBe('Log inRegister');
    expect(userNav.find('button:hidden').text()).toBe('Log out');
  });

  it('should display logout when user is authenticated', function() {
    security.currentUser = {};
    $rootScope.$digest();
    expect(userNav.find('button:visible').text()).toBe('Log out');
    expect(userNav.find('button:hidden').text()).toBe('Log inRegister');
  });

  it('should call logout when the logout button is clicked', function () {
    spyOn(scope, 'logout');
    userNav.find('button.logout').click();
    expect(scope.logout).toHaveBeenCalled();
  });

  it('should call login when the login button is clicked', function () {
    spyOn(scope, 'login');
    userNav.find('button.login').click();
    expect(scope.login).toHaveBeenCalled();
  });
});
