'use strict';
angular.module('imvgm')
  .controller('AuthCtrl', ['$rootScope', '$scope', 'UsersService', 'AuthService', '$http', '$route', 'PlatformsService', 'PlatformsService', function($rootScope, $scope, User, auth, $http, $route, Platform, Genre) {

    $scope.login = function () {
      auth.login($scope.login.username, $scope.login.password)
        .then(function (data) {
          $http.defaults.headers.common['Auth-Token'] = data.user.username + ':' + data['auth-token'];
          // Store authToken and userId in sessionStorage
          sessionStorage.setItem('authToken', data.user.username + ':' + data['auth-token']);
          sessionStorage.setItem('userId', data.user.id);
          $rootScope.$broadcast('event:loggedIn');
          window.location = '/#/';
        });

    };

    $scope.register = function () {

      auth.register($scope.formData)
        .then(
          // Callback
          function (user) {
            console.log(user);
          },
          // Errback
          function (err) {
            console.log(err);
          }
        );
    };

    $scope.getUsers = function (id) {
      auth.getCurrentUser()
        .then(function (user) {
          console.log(user);
        });
    };

    $scope.platformSelectOptions = {
      data: function () {
        return {
          results: $scope.platforms
        }
      }
    };

    $scope.genresSelectOptions = {
      data: function () {
        return {
          results: $scope.genres
        }
      }
    };

    $scope.countriesSelectOptions = {
      data: function () {
        return {
          results: [
            {
              id:'afghanistan',
              text: 'afganistan'
            }/*,*/
            // {id:'aland Islands'},
            // {id:'albania'},
            // {id:'algeria'},
            // {id:'american Samoa'},
            // {id:'andorra'},
            // {id:'angola'},
            // {id:'anguilla'},
            // {id:'antarctica'},
            // {id:'antigua And Barbuda'},
            // {id:'argentina'},
            // {id:'armenia'},
            // {id:'aruba'},
            // {id:'australia'},
            // {id:'austria'},
            // {id:'azerbaijan'},
            // {id:'bahamas'},
            // {id:'bahrain'},
            // {id:'bangladesh'},
            // {id:'barbados'},
            // {id:'belarus'},
            // {id:'belgium'},
            // {id:'belize'},
            // {id:'benin'},
            // {id:'bermuda'},
            // {id:'bhutan'},
            // {id:'bolivia Plurinational State Of'},
            // {id:'bonaire Sint Eustatius And Saba'},
            // {id:'bosnia And Herzegovina'},
            // {id:'botswana'},
            // {id:'bouvet Island'},
            // {id:'brazil'},
            // {id:'british Indian Ocean Territory'},
            // {id:'brunei Darussalam'},
            // {id:'bulgaria'},
            // {id:'burkina Faso'},
            // {id:'burundi'},
            // {id:'cambodia'},
            // {id:'cameroon'},
            // {id:'canada'},
            // {id:'cape Verde'},
            // {id:'cayman Islands'},
            // {id:'central African Republic'},
            // {id:'chad'},
            // {id:'chile'},
            // {id:'china'},
            // {id:'christmas Island'},
            // {id:'cocos Keeling) Islands'},
            // {id:'colombia'},
            // {id:'comoros'},
            // {id:'congo'},
            // {id:'congo The Democratic Republic Of The'},
            // {id:'cook Islands'},
            // {id:'costa Rica'},
            // {id:'cote D\'ivoire'},
            // {id:'croatia'},
            // {id:'cuba'},
            // {id:'curacao'},
            // {id:'cyprus'},
            // {id:'czech Republic'},
            // {id:'denmark'},
            // {id:'djibouti'},
            // {id:'dominica'},
            // {id:'dominican Republic'},
            // {id:'ecuador'},
            // {id:'egypt'},
            // {id:'el Salvador'},
            // {id:'equatorial Guinea'},
            // {id:'eritrea'},
            // {id:'estonia'},
            // {id:'ethiopia'},
            // {id:'falkland Islands Malvinas'},
            // {id:'faroe Islands'},
            // {id:'fiji'},
            // {id:'finland'},
            // {id:'france'},
            // {id:'french Guiana'},
            // {id:'french Polynesia'},
            // {id:'french Southern Territories'},
            // {id:'gabon'},
            // {id:'gambia'},
            // {id:'georgia'},
            // {id:'germany'},
            // {id:'ghana'},
            // {id:'gibraltar'},
            // {id:'greece'},
            // {id:'greenland'},
            // {id:'grenada'},
            // {id:'guadeloupe'},
            // {id:'guam'},
            // {id:'guatemala'},
            // {id:'guernsey'},
            // {id:'guinea'},
            // {id:'guinea-bissau'},
            // {id:'guyana'},
            // {id:'haiti'},
            // {id:'heard Island And Mcdonald Islands'},
            // {id:'holy See Vatican City State'},
            // {id:'honduras'},
            // {id:'hong Kong'},
            // {id:'hungary'},
            // {id:'iceland'},
            // {id:'india'},
            // {id:'indonesia'},
            // {id:'iran Islamic Republic Of'},
            // {id:'iraq'},
            // {id:'ireland'},
            // {id:'isle Of Man'},
            // {id:'israel'},
            // {id:'italy'},
            // {id:'jamaica'},
            // {id:'japan'},
            // {id:'jersey'},
            // {id:'jordan'},
            // {id:'kazakhstan'},
            // {id:'kenya'},
            // {id:'kiribati'},
            // {id:'korea Democratic People\'s Republic Of'},
            // {id:'korea Republic Of'},
            // {id:'kuwait'},
            // {id:'kyrgyzstan'},
            // {id:'lao People\'s Democratic Republic'},
            // {id:'latvia'},
            // {id:'lebanon'},
            // {id:'lesotho'},
            // {id:'liberia'},
            // {id:'libyan Arab Jamahiriya'},
            // {id:'liechtenstein'},
            // {id:'lithuania'},
            // {id:'luxembourg'},
            // {id:'macao'},
            // {id:'macedonia The Former Yugoslav Republic Of'},
            // {id:'madagascar'},
            // {id:'malawi'},
            // {id:'malaysia'},
            // {id:'maldives'},
            // {id:'mali'},
            // {id:'malta'},
            // {id:'marshall Islands'},
            // {id:'martinique'},
            // {id:'mauritania'},
            // {id:'mauritius'},
            // {id:'mayotte'},
            // {id:'mexico'},
            // {id:'micronesia Federated States Of'},
            // {id:'moldova Republic Of'},
            // {id:'monaco'},
            // {id:'mongolia'},
            // {id:'montenegro'},
            // {id:'montserrat'},
            // {id:'morocco'},
            // {id:'mozambique'},
            // {id:'myanmar'},
            // {id:'namibia'},
            // {id:'nauru'},
            // {id:'nepal'},
            // {id:'netherlands'},
            // {id:'new Caledonia'},
            // {id:'new Zealand'},
            // {id:'nicaragua'},
            // {id:'niger'},
            // {id:'nigeria'},
            // {id:'niue'},
            // {id:'norfolk Island'},
            // {id:'northern Mariana Islands'},
            // {id:'norway'},
            // {id:'oman'},
            // {id:'pakistan'},
            // {id:'palau'},
            // {id:'palestinian Territory Occupied'},
            // {id:'panama'},
            // {id:'papua New Guinea'},
            // {id:'paraguay'},
            // {id:'peru'},
            // {id:'philippines'},
            // {id:'pitcairn'},
            // {id:'poland'},
            // {id:'portugal'},
            // {id:'puerto Rico'},
            // {id:'qatar'},
            // {id:'reunion'},
            // {id:'romania'},
            // {id:'russian Federation'},
            // {id:'rwanda'},
            // {id:'saint Barthelemy'},
            // {id:'saint Helena Ascension And Tristan Da Cunha'},
            // {id:'saint Kitts And Nevis'},
            // {id:'saint Lucia'},
            // {id:'saint Martin French Part'},
            // {id:'saint Pierre And Miquelon'},
            // {id:'saint Vincent And The Grenadines'},
            // {id:'samoa'},
            // {id:'san Marino'},
            // {id:'sao Tome And Principe'},
            // {id:'saudi Arabia'},
            // {id:'senegal'},
            // {id:'serbia'},
            // {id:'seychelles'},
            // {id:'sierra Leone'},
            // {id:'singapore'},
            // {id:'sint Maarten Dutch Part'},
            // {id:'slovakia'},
            // {id:'slovenia'},
            // {id:'solomon Islands'},
            // {id:'somalia'},
            // {id:'south Africa'},
            // {id:'south Georgia And The South Sandwich Islands'},
            // {id:'spain'},
            // {id:'sri Lanka'},
            // {id:'sudan'},
            // {id:'suriname'},
            // {id:'svalbard And Jan Mayen'},
            // {id:'swaziland'},
            // {id:'sweden'},
            // {id:'switzerland'},
            // {id:'syrian Arab Republic'},
            // {id:'taiwan Province Of China'},
            // {id:'tajikistan'},
            // {id:'tanzania United Republic Of'},
            // {id:'thailand'},
            // {id:'timor-leste'},
            // {id:'togo'},
            // {id:'tokelau'},
            // {id:'tonga'},
            // {id:'trinidad And Tobago'},
            // {id:'tunisia'},
            // {id:'turkey'},
            // {id:'turkmenistan'},
            // {id:'turks And Caicos Islands'},
            // {id:'tuvalu'},
            // {id:'uganda'},
            // {id:'ukraine'},
            // {id:'united Arab Emirates'},
            // {id:'united Kingdom'},
            // {id:'united States'},
            // {id:'united States Minor Outlying Islands'},
            // {id:'uruguay'},
            // {id:'uzbekistan'},
            // {id:'vanuatu'},
            // {id:'venezuela Bolivarian Republic Of'},
            // {id:'viet Nam'},
            // {id:'virgin Islands British'},
            // {id:'virgin Islands U.s.'},
            // {id:'wallis And Futuna'},
            // {id:'western Sahara'},
            // {id:'yemen'},
            // {id:'zambia'},
            // {id:'zimbabwe'}
          ]
        }
      }
    };

    Platform.index(function (platforms) {
      $scope.platforms = platforms.map(function (platform) {
        return {
          id: platform.id,
          text: platform.name
        };
      });
    });

    Genre.index(function (genres) {
      $scope.genres = genres.map(function (genre) {
        return {
          id: genre.id,
          text: genre.name
        };
      });
    });

  }]);


