/**
 * Angular module for ppc component. This component is divided to following logical components:
 *
 *
 * Each component has it own configuration for ui-router.
 */
(function() {
  'use strict';

  // Define frontend.admin module
  angular.module('frontend.ppc', [
    'frontend.ppc.home',
    'frontend.ppc.product',
    'frontend.ppc.managerCampaign',
    'frontend.ppc.campaign',
    'frontend.ppc.power',
    'frontend.ppc.profile',
    'frontend.ppc.pchange',
    'frontend.ppc.echange',
    'frontend.ppc.settings',
    'frontend.amazon_callback'
  ]);

  // Module configuration
  angular.module('frontend.ppc')
    .config([
      '$stateProvider',
      function($stateProvider) {
        $stateProvider
          .state('ppc', {
            parent: 'frontend',
            data: {
              access: 1
            },
            views: {
              'content@': {
                controller: [
                  '$state',
                  function ($state, AuthService) {
                    if (AuthService.isAuthenticated()) {
                      $state.go('ppc.home');
                    } else {
                      $state.go('auth.login');
                    }
                  }
                ]
              },
              'pageNavigation@': {
                templateUrl: '/frontend/core/layout/partials/navigation.html',
                controller: 'NavigationController',
                resolve: {
                  _items: [
                    'ContentNavigationItems',
                    function resolve(ContentNavigationItems) {
                      return ContentNavigationItems.getItems('ppc');
                    }
                  ]
                }
              }
            }
          })
        ;
      }
    ])
    .run(['$rootScope', '$state', '$timeout', 'SettingsModel', 'UserService', 'AuthService', 'HomeModel',
      function($rootScope, $state, $timeout, SettingsModel, UserService, AuthService, HomeModel) {

      $rootScope.updatecurrency = function (selectedcurrency1) {
        $rootScope.selectedcurrency1 = selectedcurrency1;
        var currency = selectedcurrency1.name;
        $timeout(function () {
          switch (currency) {
            case 'JPY':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "¥";
                $rootScope.currency_rate = $rootScope.currencies.rates.JPY;
              });
              break;
            case 'GBP':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "£";
                $rootScope.currency_rate = $rootScope.currencies.rates.GBP;
              });
              break;
            case 'EUR':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "€";
                $rootScope.currency_rate = $rootScope.currencies.rates.EUR;
              });
              break;
            case 'INR':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "₹";
                $rootScope.currency_rate = $rootScope.currencies.rates.INR;
              });
              break;
            case 'MXN':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "";
                $rootScope.currency_rate = $rootScope.currencies.rates.MXN;
              });
              break;
            case 'CAD':
              $rootScope.$apply(function () {
                $rootScope.currency_sign = '$';
                $rootScope.currency_rate = $rootScope.currencies.rates.CAD;
              });
              break;
            default:
              $rootScope.$apply(function () {
                $rootScope.currency_sign = "$";
                $rootScope.currency_rate = 1;
              });
              break;
          }
          $rootScope.$broadcast('CURRENCY_UPDATED');
        });
      };

      $rootScope.initCurrentCurrency = function() {
        $rootScope.loadCurrencyRates($rootScope);

        if ($rootScope.selectedcurrency1 == null || typeof $rootScope.selectedcurrency1 === 'undefined') {
          $rootScope.selectedcurrency1 = $rootScope.currency1[0];
        }

        switch ($rootScope.selectedcurrency1.name) {
          case 'JPY':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "¥";
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.JPY;
              $rootScope.selectedcurrency1 = $rootScope.currency1[1];
              $rootScope.currency_rate = $rootScope.currencies.rates.JPY;
            });
            break;
          case 'GBP':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "£";
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.GBP;
              $rootScope.selectedcurrency1 = $rootScope.currency1[2];
              $rootScope.currency_rate = $rootScope.currencies.rates.GBP;
            });
            break;
          case 'EUR':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "€";
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.EUR;
              $rootScope.selectedcurrency1 = $rootScope.currency1[3];
              $rootScope.currency_rate = $rootScope.currencies.rates.EUR;
            });
            break;
          case 'INR':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "₹";
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.INR;
              $rootScope.selectedcurrency1 = $rootScope.currency1[4];
              $rootScope.currency_rate = $rootScope.currencies.rates.INR;
            });
            break;
          case 'MXN':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "";
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.MXN;
              $rootScope.selectedcurrency1 = $rootScope.currency1[5];
              $rootScope.currency_rate = $rootScope.currencies.rates.MXN;
            });
            break;
          case 'CAD':
            $rootScope.$apply(function () {
              $rootScope.currency_sign = '$';
              $rootScope.currency_rate_USD = $rootScope.currencies.rates.CAD;
              $rootScope.selectedcurrency1 = $rootScope.currency1[6];
              $rootScope.currency_rate = $rootScope.currencies.rates.CAD;
            });
            break;
          default:
            $rootScope.$apply(function () {
              $rootScope.currency_sign = "$";
              $rootScope.currency_rate_USD = 1;
              $rootScope.selectedcurrency1 = $rootScope.currency1[0];
              $rootScope.currency_rate = 1;
            });
            break;
        }
      };

      $rootScope.checkAccountCancelled = function() {
        SettingsModel
        .check_cancelled({user: $rootScope.user.id})
        .then(function (response) {
          if ( response.status === 'cancelled') {
            $rootScope.status=1;
            $state.go('ppc.settings');
          }
        });
      };

      $rootScope.loadSettings = function($scope) {
        $rootScope.currency1 = [
          {name: "USD", id: 1},
          {name: "JPY", id: 2},
          {name: "GBP", id: 3},
          {name: "EUR", id: 4},
          {name: 'INR', id: 5},
          {name: 'MXN', id: 6},
          {name: 'CAD', id: 7},
        ];

        if ($rootScope.selectedcurrency1 == null || typeof $rootScope.selectedcurrency1 === 'undefined') {
          $rootScope.selectedcurrency1 = $rootScope.currency1[0];
        }

        SettingsModel
          .getvalues({
            user: $rootScope.user.id
          })
          .then(function (response) {
            $timeout(function () {
              $rootScope.checkAccountCancelled($scope);
              $rootScope.initCurrentCurrency();
            });

            $scope.countries2 = [];
            $rootScope.accounts_list = [];

            if (response.length === 0) {
              return;
            }

            $scope.settingsall = response;
            angular.forEach(response, function (member, index) {
              //Just add the index to your item
              member.index = index;

              $scope.countries2.push(member.country_id);
              $rootScope.accounts_list.push(member.country_id + ' - ' + member.SellerID);

              if (member.user == $scope.user.id) {
                $scope.countries3 = member.country_id;
                $rootScope.accounts_list_selected = member.country_id + ' - ' + member.SellerID;
              }
            });

            $("#country1").countrySelect("destroy");
            $("#country1").countrySelect({onlyCountries: $scope.countries2});
            $("#country1").countrySelect("selectCountry", $scope.countries3);
          });
      };

      var setUpdateAccountHandler = function() {
        $rootScope.updateaccount = function (acc) {
          angular.forEach($rootScope.settingsall, function (member, index) {
            //Just add the index to your item
            if ((member.country_id + ' - ' + member.SellerID) === acc) {
              $rootScope.setUser = member.user;
              $rootScope.accounts_list_selected = acc;
            }
          });

          if ($state.is('ppc.home')) {
            $state.reload();
          } else {
            $state.go('ppc.home');
          }
        };
      };

      $rootScope.checkAccountIsSetup = function() {
        HomeModel.checkAccountIsSetup({user: $rootScope.setUser})
          .then(function(response) {
            if(response[0].totalCount == 0) {
              $state.go('ppc.settings');
            }
          });
      };

      $rootScope.loadCurrencyRates = function($scope) {
        if ($scope.currencies != null && typeof $scope.currencies != 'undefined') {
          return;
        }

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var currencies = JSON.parse(xmlHttp.responseText);
            $scope.currencies = currencies;
            $rootScope.currencies = currencies;
          }
        };
        xmlHttp.open("GET", 'https://api.fixer.io/latest?base=USD', true); // true for asynchronous
        xmlHttp.send(null);
      };

      setUpdateAccountHandler();

      $rootScope.initPage = function($scope) {
        $rootScope.loadCurrentUser($scope);
        $rootScope.loadCurrencyRates($scope);
        $rootScope.checkAccountIsSetup();
        setUpdateAccountHandler();
      };

      $rootScope.loadCurrentUser = function($scope) {
        $scope.user = UserService.user();
        // Set current scope reference to models
        if ($scope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        } else {
          $scope.setUser = $scope.user.id;
        }
      };

      $rootScope.init = function() {
        if(AuthService.isAuthenticated()) {
          $rootScope.initLogin();
        }
      };
      $rootScope.initLogin = function() {
        $rootScope.loadCurrentUser($rootScope);
        $rootScope.loadSettings($rootScope);
        $rootScope._dtSetting.init();
      };

      $rootScope.dt = [];

      $rootScope._dtSetting = {
        length: [],
        init: function(){
          $rootScope._dtSetting.length['search_pro'] = 10;
          $rootScope._dtSetting.length['search_unpro'] = 10;
          $rootScope._dtSetting.length['key_pro'] = 10;
          $rootScope._dtSetting.length['key_unpro'] = 10;
          $rootScope._dtSetting.length['start'] = 10;
          $rootScope._dtSetting.length['search_neg'] = 10;
          $rootScope._dtSetting.length['key_main'] = 10;
        },
        save: function(key, value){
          $rootScope._dtSetting.length[key] = value;
        }
      }

      $rootScope.applyFilters = function(model, testmodel, defaultmodel) {
        var _def = {
          profitfrom: null, profitto: null,
          revenuefrom: null, revenueto: null,
          adspendfrom: null, adspendto: null,
          acosfrom: null, acosto: null,
          impressionsfrom: null, impressionsto: null,
          clicksfrom: null, clicksto: null,
          ctrfrom: null, ctrto: null,
          avecpcfrom: null, avecpcto: null,
          ordersFrom: null, ordersTo: null,
          conversionRateFrom: null, conversionRateTo: null,
          match1: 'ANY'
        };
        var df = _.extend(_def, defaultmodel);
        _.each(_def, function(val, key) {
          testmodel[key] = (typeof model[key] === "undefined" || model[key] === null || model[key] === '') ? df[key] : model[key];
        });
      };

      $rootScope.applyFilters1 = function(model, testmodel, defaultmodel) {
        $rootScope.applyFilters(model, testmodel, _.extend({
          profitfrom: -99999999, profitto: 99999999,
          revenuefrom: -99999999, revenueto: 99999999,
          adspendfrom: -99999999, adspendto: 99999999,
          acosfrom: -99999999, acosto: 99999999,
          impressionsfrom: -99999999, impressionsto: 99999999,
          clicksfrom: -99999999, clicksto: 99999999,
          ctrfrom: -99999999, ctrto: 99999999,
          avecpcfrom: -99999999, avecpcto: 99999999,
          ordersFrom: -99999999, ordersTo: 99999999,
          conversionRateFrom: -99999999, conversionRateTo: 99999999
        }, defaultmodel));
      };

      $rootScope.init();
    }]);
}());
