(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .controller('SingleCampaignStatisticsController', [
      '$scope', '$rootScope', '$state', '$stateParams', 'MessageService', 'HomeModel', '$filter',
      'ListConfig', 'SocketHelperService', 'SettingsModel',
      'UserService', 'CampaignModel', 'CampaignLogModel', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, MessageService, HomeModel, $filter,
        ListConfig, SocketHelperService, SettingsModel,
        UserService, CampaignModel, CampaignLogModel, $timeout) {
        $scope.user = UserService.user();

        $scope.categories = [{
            id: 0,
            name: "Select a field..."
          },
          {
            id: 1,
            name: "Added keywords"
          },
          {
            id: 2,
            name: "Negative exact"
          },
          {
            id: 3,
            name: "Negative phrase"
          },
          {
            id: 4,
            name: "Paused keywords"
          },
          {
            id: 5,
            name: "Adjusted keyword bid"
          },
          {
            id: 6,
            name: "Adjusted daily budget"
          },
          {
            id: 7,
            name: "Adjusted campaign budget"
          }
        ];

        $scope.onCategoryChange = function() {
          $scope.show = {};

          switch ($scope.itemSelected.id) {
            case 1:
              $scope.show.row1 = 1;
              break;
            case 2:
              $scope.show.row2 = 1;
              break;
            case 3:
              $scope.show.row3 = 1;
              break;
            case 4:
              $scope.show.row4 = 1;
              break;
            case 5:
              $scope.show.row5 = 1;
              break;
            case 6:
              $scope.show.row6 = 1;
              break;
            case 7:
              $scope.show.row7 = 1;
              break;
            case 7:
              $scope.show.row8 = 1;
              break;
          }
          $scope.show.bt = 1;
        };

        $scope.itemSelected = $scope.categories[0];

        $scope.ApplyModel = function(i, location) {

          var testmodel3 = {};

          if (typeof $scope.model3.revenuefrom === "undefined" || $scope.model3.revenuefrom === null || $scope.model3.revenuefrom === '') testmodel3.revenuefrom = -99999999;
          else testmodel3.revenuefrom = $scope.model3.revenuefrom;
          if (typeof $scope.model3.revenueto === "undefined" || $scope.model3.revenueto === null || $scope.model3.revenueto === '') testmodel3.revenueto = 99999999;
          else testmodel3.revenueto = $scope.model3.revenueto;
          if (typeof $scope.model3.adspendfrom === "undefined" || $scope.model3.adspendfrom === null || $scope.model3.adspendfrom === '') testmodel3.adspendfrom = -99999999;
          else testmodel3.adspendfrom = $scope.model3.adspendfrom;
          if (typeof $scope.model3.adspendto === "undefined" || $scope.model3.adspendto === null || $scope.model3.adspendto === '') testmodel3.adspendto = 99999999;
          else testmodel3.adspendto = $scope.model3.adspendto;
          if (typeof $scope.model3.acosfrom === "undefined" || $scope.model3.acosfrom === null || $scope.model3.acosfrom === '') testmodel3.acosfrom = 40;
          else testmodel3.acosfrom = $scope.model3.acosfrom;
          if (typeof $scope.model3.acosto === "undefined" || $scope.model3.acosto === null || $scope.model3.acosto === '') testmodel3.acosto = 0;
          else testmodel3.acosto = $scope.model3.acosto;
          if (typeof $scope.model3.impressionsfrom === "undefined" || $scope.model3.impressionsfrom === null || $scope.model3.impressionsfrom === '') testmodel3.impressionsfrom = -99999999;
          else testmodel3.impressionsfrom = $scope.model3.impressionsfrom;
          if (typeof $scope.model3.impressionsto === "undefined" || $scope.model3.impressionsto === null || $scope.model3.impressionsto === '') testmodel3.impressionsto = 99999999;
          else testmodel3.impressionsto = $scope.model3.impressionsto;
          if (typeof $scope.model3.clicksfrom === "undefined" || $scope.model3.clicksfrom === null || $scope.model3.clicksfrom === '') testmodel3.clicksfrom = -99999999;
          else testmodel3.clicksfrom = $scope.model3.clicksfrom;
          if (typeof $scope.model3.clicksto === "undefined" || $scope.model3.clicksto === null || $scope.model3.clicksto === '') testmodel3.clicksto = 99999999;
          else testmodel3.clicksto = $scope.model3.clicksto;
          if (typeof $scope.model3.ctrfrom === "undefined" || $scope.model3.ctrfrom === null || $scope.model3.ctrfrom === '') testmodel3.ctrfrom = -99999999;
          else testmodel3.ctrfrom = $scope.model3.ctrfrom;
          if (typeof $scope.model3.ctrto === "undefined" || $scope.model3.ctrto === null || $scope.model3.ctrto === '') testmodel3.ctrto = 99999999;
          else testmodel3.ctrto = $scope.model3.ctrto;
          if (typeof $scope.model3.avecpcfrom === "undefined" || $scope.model3.avecpcfrom === null || $scope.model3.avecpcfrom === '') testmodel3.avecpcfrom = -99999999;
          else testmodel3.avecpcfrom = $scope.model3.avecpcfrom;
          if (typeof $scope.model3.avecpcto === "undefined" || $scope.model3.avecpcto === null || $scope.model3.avecpcto === '') testmodel3.avecpcto = 99999999;
          else testmodel3.avecpcto = $scope.model3.avecpcto;
          if (typeof $scope.model3.ordersFrom === "undefined" || $scope.model3.ordersFrom === null || $scope.model3.ordersFrom === '') testmodel3.ordersFrom = -99999999;
          else testmodel3.ordersFrom = $scope.model3.ordersFrom;
          if (typeof $scope.model3.ordersTo === "undefined" || $scope.model3.ordersTo === null || $scope.model3.ordersTo === '') testmodel3.ordersTo = 99999999;
          else testmodel3.ordersTo = $scope.model3.ordersTo;
          if (typeof $scope.model3.conversionRateFrom === "undefined" || $scope.model3.conversionRateFrom === null || $scope.model3.conversionRateFrom === '') testmodel3.conversionRateFrom = -99999999;
          else testmodel3.conversionRateFrom = $scope.model3.conversionRateFrom;
          if (typeof $scope.model3.conversionRateTo === "undefined" || $scope.model3.conversionRateTo === null || $scope.model3.conversionRateTo === '') testmodel3.conversionRateTo = 99999999;
          else testmodel3.conversionRateTo = $scope.model3.conversionRateTo;
          if (typeof $scope.model3.match1 === "undefined" || $scope.model3.match1 === null || $scope.model3.match1 === '') testmodel3.match1 = 'ANY';
          else testmodel3.match1 = $scope.model3.match1;

          switch (i) {
            case 3:
              var searchbyACoS = CampaignModel.searchbyACoS({
                  campaign: $stateParams.campaign,
                  user: $scope.user.id,
                  startDate: $scope.datePicker.date.startDate,
                  endDate: $scope.datePicker.date.endDate,
                  revenuefrom: testmodel3.revenuefrom,
                  revenueto: testmodel3.revenueto,
                  adspendfrom: testmodel3.adspendfrom,
                  adspendto: testmodel3.adspendto,
                  acosfrom: testmodel3.acosfrom,
                  acosto: testmodel3.acosto,
                  impressionsfrom: testmodel3.impressionsfrom,
                  impressionsto: testmodel3.impressionsto,
                  clicksfrom: testmodel3.clicksfrom,
                  clicksto: testmodel3.clicksto,
                  ctrfrom: testmodel3.ctrfrom,
                  ctrto: testmodel3.ctrto,
                  avecpcfrom: testmodel3.avecpcfrom,
                  avecpcto: testmodel3.avecpcto,
                  ordersFrom: testmodel3.ordersFrom,
                  ordersTo: testmodel3.ordersTo,
                  conversionRateFrom: testmodel3.conversionRateFrom,
                  conversionRateTo: testmodel3.conversionRateTo,
                  match1: testmodel3.match1

                })
                .then(function(response) {
                  $scope.searchterms = response;
                });
              break;
            default:
          }
        };
      }
    ]);
  }());
