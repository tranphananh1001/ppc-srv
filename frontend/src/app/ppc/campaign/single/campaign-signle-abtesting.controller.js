(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .controller('SingleCampaignABTestingController', [
      '$scope', '$rootScope', '$state', '$stateParams', 'MessageService', 'HomeModel', '$filter',
      'ListConfig', 'SocketHelperService', 'SettingsModel',
      'UserService', 'CampaignModel', 'CampaignLogModel', 'DTOptionsBuilder', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, MessageService, HomeModel, $filter,
        ListConfig, SocketHelperService, SettingsModel,
        UserService, CampaignModel, CampaignLogModel, DTOptionsBuilder, $timeout) {
        $scope.user = UserService.user();

        $scope.dtOptions = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400).withOption('aaSorting', [
            [1, 'desc']
          ]).withButtons([
            'copyHtml5',
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5'
          ]);

        $scope.test_show = function(id) {

          delete $scope.abtests;
          delete $scope.show;

          $scope.abtests = {};
          $scope.show = {};

          $scope.add_test = function() {
            delete $scope.abtests;
            delete $scope.show;

            $scope.abtests = {};
            $scope.show = {};
            $scope.abtests.before_timeframe = 14;
          };
          $scope.reload_test = function() {
            CampaignModel.getalltests({
              user: $scope.user.id,
              id: $stateParams.id
            })
            .then(function(response) {
              $scope.abtest = response;
            });
          };
          $scope.save_test = function() {
            // check for required fields
            if (typeof $scope.abtests.name !== 'undefined' && $scope.abtests.name !== null) {
              if (typeof $scope.show === 'undefined' || $scope.show === null) {
                $scope.show = {};
              }

              var savetest = CampaignModel.savenewtest({
                  user: $scope.user.id,
                  added_keywords: $scope.abtests.added_keywords,
                  negative_exact: $scope.abtests.negative_exact,
                  negative_phrase: $scope.abtests.negative_phrase,
                  paused_keywords: $scope.abtests.paused_keywords,
                  adjusted_keyword_bid: $scope.abtests.adjusted_keyword_bid,
                  adjusted_daily_budget: $scope.abtests.adjusted_daily_budget,
                  adjusted_campaign_budget: $scope.abtests.adjusted_campaign_budget,
                  before_bullet3: $scope.abtests.before_bullet3,
                  before_bullet4: $scope.abtests.before_bullet4,
                  before_bullet5: $scope.abtests.before_bullet5,
                  before_coupon: $scope.abtests.before_coupon,
                  before_discount: $scope.abtests.before_discount,
                  before_photo1: $scope.abtests.before_photo1,
                  before_photo2: $scope.abtests.before_photo2,
                  before_photo3: $scope.abtests.before_photo3,
                  before_photo4: $scope.abtests.before_photo4,
                  before_photo5: $scope.abtests.before_photo5,
                  before_photo6: $scope.abtests.before_photo6,
                  before_photo7: $scope.abtests.before_photo7,
                  before_photo8: $scope.abtests.before_photo8,
                  before_photo9: $scope.abtests.before_photo9,
                  before_price: $scope.abtests.before_price,
                  before_summary: $scope.abtests.before_summary,
                  before_title: $scope.abtests.before_title,
                  after_backend1: $scope.abtests.after_backend1,
                  after_backend2: $scope.abtests.after_backend2,
                  after_backend3: $scope.abtests.after_backend3,
                  after_backend4: $scope.abtests.after_backend4,
                  after_backend5: $scope.abtests.after_backend5,
                  after_bullet1: $scope.abtests.after_bullet1,
                  after_bullet2: $scope.abtests.after_bullet2,
                  after_bullet3: $scope.abtests.after_bullet3,
                  after_bullet4: $scope.abtests.after_bullet4,
                  after_bullet5: $scope.abtests.after_bullet5,
                  after_coupon: $scope.abtests.after_coupon,
                  after_discount: $scope.abtests.after_discount,
                  after_photo1: $scope.abtests.after_photo1,
                  after_photo2: $scope.abtests.after_photo2,
                  after_photo3: $scope.abtests.after_photo3,
                  after_photo4: $scope.abtests.after_photo4,
                  after_photo5: $scope.abtests.after_photo5,
                  after_photo6: $scope.abtests.after_photo6,
                  after_photo7: $scope.abtests.after_photo7,
                  after_photo8: $scope.abtests.after_photo8,
                  after_photo9: $scope.abtests.after_photo9,
                  after_price: $scope.abtests.after_price,
                  after_summary: $scope.abtests.after_summary,
                  after_title: $scope.abtests.after_title,
                  campaign: $scope.campaignName,
                  name: $scope.abtests.name,
                  before_timeframe: $scope.abtests.before_timeframe

                })
                .then(function(response) {
                  MessageService.success('Test saved');
                  $scope.show = {};
                  $scope.show.sav = true;

                  $scope.dtInstance.rerender();

                });
            } else {
              MessageService.error('Test name required');
            }
          };

          var testbyID = CampaignModel.gettestbyID({
              user: $scope.user.id,
              id: id
            })
            .then(function(response) {
              $scope.abtests = response[0];
              $scope.show.sav = true;
              var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
              var firstDate = new Date($scope.abtests.to_date);
              var secondDate = new Date();
              var secondDate1 = new Date($scope.abtests.from_date);

              $scope.abtests.before_timeframe = Math.round(((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
              $scope.abtests.before_timeframe1 = Math.round(((secondDate1.getTime() - firstDate.getTime()) / (oneDay)));

              var testbyIDa = CampaignModel.getabtestsstats({
                user: $scope.user.id,
                id: $stateParams.id,
                startDate: moment($scope.abtests.from_date).add($scope.abtests.before_timeframe1, 'days'),
                endDate: moment($scope.abtests.from_date)
              }).then(function(Before_response) {
                $scope.before_KPI = Before_response[0];

                $scope.before_uprevenue = $scope.before_KPI.Revenue;
                $scope.before_uporders = $scope.before_KPI.Orders;
                $scope.before_upcost = $scope.before_KPI.Cost;
                $scope.before_upacos = $scope.before_KPI.Cost / $scope.before_KPI.Revenue * 100;
                $scope.before_upcpc = $scope.before_KPI.Cost / $scope.before_KPI.Clicks;
                $scope.before_upimpressions = $scope.before_KPI.Impressions;
                $scope.before_upctr = $scope.before_KPI.Clicks / $scope.before_KPI.Impressions * 100;
                $scope.before_upclicks = $scope.before_KPI.Clicks;
                $scope.before_upcr = $scope.before_KPI.Orders / $scope.before_KPI.Clicks * 100;
                $scope.before_upprofit = $scope.before_KPI.Profit;
                $scope.before_conversion = $scope.before_KPI.Conversion * 100;
              });
              var testbyIDb = CampaignModel.getabtestsstats({
                user: $scope.user.id,
                id: $stateParams.id,
                startDate: moment($scope.abtests.from_date),
                endDate: moment($scope.abtests.to_date)
              }).then(function(Before_response) {
                $scope.after_KPI = Before_response[0];
                $scope.after_uprevenue = $scope.after_KPI.Revenue;
                $scope.after_uporders = $scope.after_KPI.Orders;
                $scope.after_upcost = $scope.after_KPI.Cost;
                $scope.after_upacos = $scope.after_KPI.Cost / $scope.after_KPI.Revenue * 100;
                $scope.after_upcpc = $scope.after_KPI.Cost / $scope.after_KPI.Clicks;
                $scope.after_upimpressions = $scope.after_KPI.Impressions;
                $scope.after_upctr = $scope.after_KPI.Clicks / $scope.after_KPI.Impressions * 100;
                $scope.after_upclicks = $scope.after_KPI.Clicks;
                $scope.after_upcr = $scope.after_KPI.Orders / $scope.after_KPI.Clicks * 100;
                $scope.after_upprofit = $scope.after_KPI.Profit;
                $scope.after_conversion = $scope.after_KPI.Conversion * 100;
              });
            });
        };

        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }

        Array.prototype.getUnique = function() {
          var u = {},
            a = [];
          for (var i = 0, l = this.length; i < l; ++i) {
            if (u.hasOwnProperty(this[i])) {
              continue;
            }
            a.push(this[i]);
            u[this[i]] = 1;
          }
          return a;
        };

        function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }
      }
    ]);
  }());
