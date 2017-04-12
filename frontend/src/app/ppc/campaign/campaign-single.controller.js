(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .controller('SingleCampaignController', [
      '$scope', '$rootScope', '$state', '$stateParams', 'MessageService', 'HomeModel', '$filter',
      'ListConfig', 'SocketHelperService', 'SettingsModel',
      'UserService', 'CampaignModel', 'CampaignLogModel', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, MessageService, HomeModel, $filter,
        ListConfig, SocketHelperService, SettingsModel,
        UserService, CampaignModel, CampaignLogModel, $timeout) {

        $scope.user = UserService.user();
        $stateParams.campaign = $rootScope.decodeURL($stateParams.campaign);
        $scope.campaignId = $stateParams.id;
        $scope.campaignName = $stateParams.campaign;

        $scope.opImage = '/images/S1.png';
        $timeout(function () {
          loadStartTab();
        });

        $scope.currentSetting = {};

        if ($rootScope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        }

        $scope.datePicker = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days'),
          },
        };

        //----BEGIN SETTING ----

        var load = SettingsModel.getvalues({
          user: $scope.user.id
        })
        .then(function(response) {
          $timeout(function() {
            $rootScope.initCurrentCurrency();
          });

          $scope.countries2 = [];
          if (response.length > 0) {
            $scope.settingsall = response;
            angular.forEach(response, function(member, index) {
              //Just add the index to your item
              member.index = index;

              $scope.countries2.push(member.country_id);
              if (member.user == $scope.user.id) {
                $scope.currentSetting = member;
                $scope.countries3 = member.country_id;
              }
            });

            $("#country1").countrySelect("destroy");
            $("#country1").countrySelect({
              onlyCountries: $scope.countries2
            });
            $("#country1").countrySelect("selectCountry", $scope.countries3);
          }
        });

        // ---- END SETTING ----

        $timeout(function() {
          $('.single-campaign-tab-container a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var targetId = $(e.target).data('target');

            if (targetId == '#mtab1') {
              $scope.opImage = '/images/S1.png';
              loadStartTab();
            } else if (targetId == '#mtab2') {
              if ($('.keyword-op-tab-container li.active a').attr('data-target') === '#tab-keyword-optimizer') {
                $scope.opImage = '/images/S3.png';
              } else {
                $scope.opImage = '/images/S2.png';
              }
              $scope.loadKeywordsTab();
            } else if (targetId == '#mtab4') {
              if ($('.search-term-tab-container li.active a').attr('data-target') === '#tab-negative-word-finder') {
                $scope.opImage = '/images/S5.png';
              } else {
                $scope.opImage = '/images/S4.png';
              }
              $scope.loadSearchTermTab();
            }

            setTimeout(function() {
              $.fn.dataTable.tables({
                visible: true,
                api: true
              }).columns.adjust();
            }, 100);
          });
        }, 500);

        $scope.$on('tab-changed', function ($event, tab) {
          if (tab.page === 'keyword') {
            if (tab.tabId === '#tab-keyword-optimizer') {
              $scope.opImage = '/images/S3.png';
            } else {
              $scope.opImage = '/images/S2.png';
            }
          } else if (tab.page === 'search-term') {
            if (tab.tabId === '#tab-negative-word-finder') {
              $scope.opImage = '/images/S5.png';
            } else {
              $scope.opImage = '/images/S4.png';
            }
          }
        });

        $scope.logsave = function(logtext) {
          var savelog = CampaignModel.savelog({
            user: $scope.user.id,
            text: logtext
          }).then(function(response) {
            MessageService.success('Log Saved');
          });
        };

        function loadStartTab() {
          $rootScope.$broadcast('CAMPAIGN_START_TAB_LOADED');
        }

        $scope.loadKeywordsTab = function() {
          $rootScope.$broadcast('CAMPAIGN_KEYWORDS_TAB_LOADED');
        };

        $scope.loadSearchTermTab = function() {
          $rootScope.$broadcast('CAMPAIGN_SEARCHTERM_TAB_LOADED');
        };

        $scope.updateDate = function(date) {
          var updateFlag = false;
          if (!$scope.datePicker.date.startDate.isSame(date.startDate)) {
            $scope.datePicker.date.startDate = date.startDate;
            updateFlag = true;
          }

          if (!$scope.datePicker.date.endDate.isSame(date.endDate)) {
            $scope.datePicker.date.endDate = date.endDate;
            updateFlag = true;
          }

          if (updateFlag) {
            $scope.$broadcast('CAMPAIGN_DATE_UPDATED');
          }
        }

        $scope.KPI = false;

        $scope.campaignSKUs = [];

        CampaignModel.getSkusForCampaign({
          user: $scope.user.id,
          campaignId: $scope.campaignId,
          campaign: $scope.campaignName,
        }).then(function(responseSKUs) {
          $scope.campaignSKUs = responseSKUs;

          CampaignModel.gettopKPI({
            user: $scope.user.id,
            campaign: $stateParams.campaign,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate,
          })
          .then(function(response) {
            $scope.KPI = response[0];
            $scope.$broadcast('CAMPAIGN_KPI_LOADED');
          });
        });

        $scope.updateAcos = function () {
          $scope.$broadcast('CAMPAIGN_KPI_UPDATED');
        };
      }
    ]);
}());
