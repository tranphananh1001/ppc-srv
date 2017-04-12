/*jshint camelcase: false */
(function() {
  'use strict';

  angular.module('frontend.ppc.managerCampaign')
    .controller('ManagerCampaign', ['$scope', '$state', '$stateParams', '$filter',
      'UserService', 'MessageService', 'CampaignModel', 'CampaignLogModel', 'SettingsModel', 'HomeModel',
      'ListConfig', 'SocketHelperService', 'DTOptionsBuilder', '$timeout', '$rootScope',
      function($scope, $state, $stateParams, $filter,
        UserService, MessageService, CampaignModel, CampaignLogModel, SettingsModel, HomeModel,
        ListConfig, SocketHelperService, DTOptionsBuilder, $timeout, $rootScope) {

        $scope.datePicker = {
          date: {
            startDate: null,
            endDate: null,
          },
        };

        $scope.dateRangeOptions = {
          showDropdowns: true,
          linkedCalendars: false,
          ranges: {
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            "Last 60 Days": [moment().subtract(59, 'days'), moment()],
            "Last 90 Days": [moment().subtract(89, 'days'), moment()],
            "Last 120 Days": [moment().subtract(119, 'days'), moment()]
          },
          alwaysShowCalendars: true,
          eventHandlers: {
            'apply.daterangepicker': function() {
              $scope.loadCampaigns();
            }
          }
        };
        $scope.positive_list = {};
        $scope.negative_list = {};

        $scope.user = UserService.user();
        if ($rootScope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        }

        //Load all campaign
        $scope.loadAllCampaignsAndBySku = function() {
          CampaignModel.getAllCampaignsAndBySku({
            user: $scope.user.id
          })
          .then(function(response) {
            $scope.campaigns = response;
          });
        };

        $scope.$on('CURRENCY_UPDATED', function() {
          $scope.reloadDataTables();
        });

        $scope.reloadDataTables = function() {
          _.map($scope.dtInstances, function(_instance, type) {
            _instance.rerender();
          });
        };

        $scope.dtInstanceCallbackCampaign = function(_instance) {
          $scope.dtInstances.Campaign = _instance;
        };

        var load = SettingsModel.getvalues({
            user: $scope.user.id
        })
        .then(function(response) {

          $timeout(function() {
            $rootScope.initCurrentCurrency();
          });

          $rootScope.updateaccount = function(acc) {
            angular.forEach($scope.settingsall, function(member, index) {
              //Just add the index to your item
              if ((member.country_id + ' - ' + member.SellerID) === acc) {
                $rootScope.setUser = member.user;
              }

              if ($state.is('ppc.home')) {
                $state.reload();
              } else {
                $state.go('ppc.home');
              }
            });
          };

          $scope.countries2 = [];
          $rootScope.accounts_list = [];

          if (response.length > 0) {
            $scope.settingsall = response;
            angular.forEach(response, function(member, index) {
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
            $("#country1").countrySelect({
              onlyCountries: $scope.countries2
            });
            $("#country1").countrySelect("selectCountry", $scope.countries3);
          }

        });

        $scope.loadAllCampaignsAndBySku();

        if (!$rootScope.dt['camp_main']) {
          $rootScope.dt['camp_main'] = 10;
        }

        $scope.dtInstances = {};
        $scope.dtOptions = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('aaSorting', [
            [3, 'desc']
          ])
          .withOption('pageLength', $rootScope.dt['camp_main'])
          .withOption("drawCallback", function(row, data) {
            var api = this.api(),
              data;
            $rootScope.dt['camp_main'] = api.context[0]._iDisplayLength;
            var pagesum = [];
            for (var i = 2; i <= 8; i++) {
              pagesum[i] = api.column(i, {
                  page: 'current'
                }).data()
                .reduce(function(a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);
              if (i <= 4)
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
              if (i == 5)
                $(api.column(i).footer()).html((pagesum[4] / pagesum[3] * 100).toFixed(1).toLocaleString());
              if (i > 5)
                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
            }
          });
        var self = this;
        self.centerId = $stateParams.centerId;

        //Remove notice text when go other page
        $scope.$on('$destroy', function iVeBeenDismissed() {
          $rootScope.flag = false;
        })
      }]);
}());
