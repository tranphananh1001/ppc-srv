(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .controller('SingleCampaignStartController', [
      '$scope', '$rootScope', '$state', '$stateParams', 'MessageService', 'HomeModel', '$filter',
      'ListConfig', 'SocketHelperService', 'SettingsModel',
      'UserService', 'CampaignModel', 'CampaignLogModel', 'DTOptionsBuilder', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, MessageService, HomeModel, $filter,
        ListConfig, SocketHelperService, SettingsModel,
        UserService, CampaignModel, CampaignLogModel, DTOptionsBuilder, $timeout) {

        $scope.user = UserService.user();
        $stateParams.campaign = $rootScope.decodeURL($stateParams.campaign);
        $scope.campaignId = $stateParams.id;
        $scope.campaignName = $stateParams.campaign;
        // BEGIN DATE range

        $scope.datePicker = {};
        $scope.datePicker.date = {
          startDate: moment().subtract(37, 'days'),
          endDate: moment().subtract(7, 'days')
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
              $scope.$parent.updateDate($scope.datePicker.date);
              $scope.dateUpdated();
            }
          }
        };

        //END DATE RANGE

        $rootScope.$on('chart_start', function () {
          $scope.chart_start();
        });

        $scope.chart_start = function() {
          CampaignModel.getChartbyCampaign({
              user: $scope.user.id,
              campaign: $stateParams.campaign,
              startDate: $scope.datePicker.date.startDate,
              endDate: $scope.datePicker.date.endDate,
            })
            .then(function(response) {
              CampaignLogModel.load({
                campaign_id: $stateParams.id,
                user: $scope.user.id
              }).then(function(logs_result) {
                var tmpAry = [];
                var tmpDate = [];
                $scope.charts = response;
                $scope.data = [
                  {
                    key: 'Gross Revenue',
                    mean: 250,
                    values: [],
                  },
                  {
                    key: 'Net Revenue',
                    mean: 250,
                    values: [],
                  },
                  {
                    key: 'Ad Spend',
                    mean: 250,
                    values: [],
                  },
                  {
                    key: 'Profit',
                    mean: 250,
                    values: [],
                  },
                  {
                    key: 'Orders',
                    mean: 250,
                    values: [],
                  },
                  {
                    key: 'Tracking Results',
                    mean: 250,
                    values: [],
                  },
                ];

                for (var i = 0; i < 5; i++) {
                  tmpAry[i] = [];
                }

                $scope.charts.forEach(function(item, i, arr) {
                  var rr = new Date(item.EndDate).getTime();
                  $scope.data[0].values.push([rr, item.Revenue]);
                  tmpAry[0].push(item.Revenue);
                });

                $scope.charts.forEach(function(item, i, arr) {
                  var rr = new Date(item.EndDate).getTime();
                  $scope.data[1].values.push([rr, item.Revenue - item.Cost]);
                  tmpAry[1].push(item.Revenue - item.Cost);
                });

                $scope.charts.forEach(function(item, i, arr) {
                  var rr = new Date(item.EndDate).getTime();
                  $scope.data[2].values.push([rr, item.Cost]);
                  tmpAry[2].push(item.Cost);
                });

                $scope.charts.forEach(function(item, i, arr) {
                  var rr = new Date(item.EndDate).getTime();
                  var nn = item.Profit;
                  $scope.data[3].values.push([rr, nn]);
                  tmpAry[3].push(nn);
                });

                var maxDate;
                var minVal;
                var minAry = [];

                $scope.charts.forEach(function(item, i, arr) {
                  var rr = new Date(item.EndDate).getTime();
                  $scope.data[4].values.push([rr, item.Orders]);
                  tmpAry[4].push(item.Orders);
                  tmpDate.push(rr);
                });
                maxDate = Math.max.apply(null, tmpDate);
                for (var i = 0; i < 5; i++) {
                  minAry.push(Math.min.apply(null, tmpAry[i]));
                }

                minVal = 0;

                tmpAry = [];
                if (logs_result) {
                  for (var i = 0; i < logs_result.length; i++) {
                    if (!logs_result[i].state) {
                      continue;
                    }
                    var rr = new Date(logs_result[i].createdAt);
                    if (tmpAry.indexOf(rr.getTime()) != -1) {
                      continue;
                    }
                    if (rr > maxDate) {
                      continue;
                    }
                    tmpAry.push(rr.getTime());
                    $scope.data[5].values.push([rr.getTime(), minVal]);
                  }
                }

                $timeout(function () {
                  // FIXME: This is a dirty fix to fire another resize event which could repaint nvd3 charts.
                  // You can use ng-if instead of ng-show for tab management, but it is not possible in our case,
                  // because we don't use Angular Bootstrap, but Bootstrap for tabs.
                  window.dispatchEvent(new Event('resize'));
                });
              });
            });
        };

        // This is called by event subscription.
        //$scope.chart_start();

        // BEGIN LOAD MODELS

        // ACTUAL LOADING  ---

        $scope.model18 = {};
        $scope.modeloptions18 = {};

        function initialLoadData() {
          CampaignModel.gettopKPI({
            user: $scope.user.id,
            campaign: $stateParams.campaign,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate,
          })
          .then(function(response) {
            $scope.$parent.KPI = $scope.KPI = response[0];

            $scope.uprevenue = $scope.KPI.Revenue;
            $scope.upcost = $scope.KPI.Cost;
            $scope.uporders = $scope.KPI.Orders;
            $scope.upacos = $scope.KPI.Cost / $scope.KPI.Revenue * 100;
            $scope.upcpc = $scope.KPI.Cost / $scope.KPI.Clicks;
            $scope.upimpressions = $scope.KPI.Impressions;
            $scope.upctr = $scope.KPI.Clicks / $scope.KPI.Impressions * 100;
            $scope.upclicks = $scope.KPI.Clicks;
            $scope.upcr = $scope.KPI.Orders / $scope.KPI.Clicks * 100;
            $scope.upprofit = $scope.KPI.Profit;
            $scope.saveacos = $scope.KPI.acos1;

            $scope.ApplyModel(18);
          });
        }

        $scope.dateUpdated = function () {
          initialLoadData();
        };

        $scope.dateUpdatedFlag = true;
        $scope.$on('CAMPAIGN_DATE_UPDATED', function () {
          var date = $scope.$parent.datePicker.date;
          var updateFlag = false;
          if (!$scope.datePicker.date.startDate.isSame(date.startDate)) {
            updateFlag = true;
          }

          if (!$scope.datePicker.date.endDate.isSame(date.endDate)) {
            updateFlag = true;
          }

          if (updateFlag) {
            $scope.dateUpdatedFlag = true;
          }
        });

        $scope.$on('CAMPAIGN_START_TAB_LOADED', function() {
          if (!$scope.dateUpdatedFlag) {
            return;
          }
          $scope.datePicker.date = $scope.$parent.datePicker.date;
          $scope.dateUpdated();
          $scope.dateUpdatedFlag = false;
        });

        $scope.$on('CAMPAIGN_KPI_LOADED', function () {
          $scope.KPI = $scope.$parent.KPI;

          $scope.uprevenue = $scope.KPI.Revenue;
          $scope.upcost = $scope.KPI.Cost;
          $scope.uporders = $scope.KPI.Orders;
          $scope.upacos = $scope.KPI.Cost / $scope.KPI.Revenue * 100;
          $scope.upcpc = $scope.KPI.Cost / $scope.KPI.Clicks;
          $scope.upimpressions = $scope.KPI.Impressions;
          $scope.upctr = $scope.KPI.Clicks / $scope.KPI.Impressions * 100;
          $scope.upclicks = $scope.KPI.Clicks;
          $scope.upcr = $scope.KPI.Orders / $scope.KPI.Clicks * 100;
          $scope.upprofit = $scope.KPI.Profit;
          $scope.saveacos = $scope.KPI.acos1;

          $scope.datePicker.date = $scope.$parent.datePicker.date;

          $scope.ApplyModel(18);
          $scope.modelOptionsload(18,4);
        });

        $scope.ApplyModel = function(i) {

          var testmodel18 = {};

          if (typeof $scope.model18.profitfrom === "undefined" || $scope.model18.profitfrom === null || $scope.model18.profitfrom === '') testmodel18.profitfrom = null;
          else testmodel18.profitfrom = $scope.model18.profitfrom;
          if (typeof $scope.model18.profitto === "undefined" || $scope.model18.profitto === null || $scope.model18.profitto === '') testmodel18.profitto = null;
          else testmodel18.profitto = $scope.model18.profitto;
          if (typeof $scope.model18.revenuefrom === "undefined" || $scope.model18.revenuefrom === null || $scope.model18.revenuefrom === '') testmodel18.revenuefrom = null;
          else testmodel18.revenuefrom = $scope.model18.revenuefrom;
          if (typeof $scope.model18.revenueto === "undefined" || $scope.model18.revenueto === null || $scope.model18.revenueto === '') testmodel18.revenueto = null;
          else testmodel18.revenueto = $scope.model18.revenueto;
          if (typeof $scope.model18.adspendfrom === "undefined" || $scope.model18.adspendfrom === null || $scope.model18.adspendfrom === '') testmodel18.adspendfrom = null;
          else testmodel18.adspendfrom = $scope.model18.adspendfrom;
          if (typeof $scope.model18.adspendto === "undefined" || $scope.model18.adspendto === null || $scope.model18.adspendto === '') testmodel18.adspendto = null;
          else testmodel18.adspendto = $scope.model18.adspendto;
          if (typeof $scope.model18.acosfrom === "undefined" || $scope.model18.acosfrom === null || $scope.model18.acosfrom === '') testmodel18.acosfrom = null;
          else testmodel18.acosfrom = $scope.model18.acosfrom;
          if (typeof $scope.model18.acosto === "undefined" || $scope.model18.acosto === null || $scope.model18.acosto === '') testmodel18.acosto = null;
          else testmodel18.acosto = $scope.model18.acosto;
          if (typeof $scope.model18.impressionsfrom === "undefined" || $scope.model18.impressionsfrom === null || $scope.model18.impressionsfrom === '') testmodel18.impressionsfrom = null;
          else testmodel18.impressionsfrom = $scope.model18.impressionsfrom;
          if (typeof $scope.model18.impressionsto === "undefined" || $scope.model18.impressionsto === null || $scope.model18.impressionsto === '') testmodel18.impressionsto = null;
          else testmodel18.impressionsto = $scope.model18.impressionsto;
          if (typeof $scope.model18.clicksfrom === "undefined" || $scope.model18.clicksfrom === null || $scope.model18.clicksfrom === '') testmodel18.clicksfrom = null;
          else testmodel18.clicksfrom = $scope.model18.clicksfrom;
          if (typeof $scope.model18.clicksto === "undefined" || $scope.model18.clicksto === null || $scope.model18.clicksto === '') testmodel18.clicksto = null;
          else testmodel18.clicksto = $scope.model18.clicksto;
          if (typeof $scope.model18.ctrfrom === "undefined" || $scope.model18.ctrfrom === null || $scope.model18.ctrfrom === '') testmodel18.ctrfrom = null;
          else testmodel18.ctrfrom = $scope.model18.ctrfrom;
          if (typeof $scope.model18.ctrto === "undefined" || $scope.model18.ctrto === null || $scope.model18.ctrto === '') testmodel18.ctrto = null;
          else testmodel18.ctrto = $scope.model18.ctrto;
          if (typeof $scope.model18.avecpcfrom === "undefined" || $scope.model18.avecpcfrom === null || $scope.model18.avecpcfrom === '') testmodel18.avecpcfrom = null;
          else testmodel18.avecpcfrom = $scope.model18.avecpcfrom;
          if (typeof $scope.model18.avecpcto === "undefined" || $scope.model18.avecpcto === null || $scope.model18.avecpcto === '') testmodel18.avecpcto = null;
          else testmodel18.avecpcto = $scope.model18.avecpcto;
          if (typeof $scope.model18.ordersFrom === "undefined" || $scope.model18.ordersFrom === null || $scope.model18.ordersFrom === '') testmodel18.ordersFrom = null;
          else testmodel18.ordersFrom = $scope.model18.ordersFrom;
          if (typeof $scope.model18.ordersTo === "undefined" || $scope.model18.ordersTo === null || $scope.model18.ordersTo === '') testmodel18.ordersTo = null;
          else testmodel18.ordersTo = $scope.model18.ordersTo;
          if (typeof $scope.model18.conversionRateFrom === "undefined" || $scope.model18.conversionRateFrom === null || $scope.model18.conversionRateFrom === '') testmodel18.conversionRateFrom = null;
          else testmodel18.conversionRateFrom = $scope.model18.conversionRateFrom;
          if (typeof $scope.model18.conversionRateTo === "undefined" || $scope.model18.conversionRateTo === null || $scope.model18.conversionRateTo === '') testmodel18.conversionRateTo = null;
          else testmodel18.conversionRateTo = $scope.model18.conversionRateTo;
          if (typeof $scope.model18.match1 === "undefined" || $scope.model18.match1 === null || $scope.model18.match1 === '') testmodel18.match1 = 'ANY';
          else testmodel18.match1 = $scope.model18.match1;

          switch (i) {
            case 18:
              CampaignModel.getbelowacos({
                  user: $scope.user.id,
                  campaign: $stateParams.campaign,
                  adgroup: $scope.currentAdGroup,
                  startDate: $scope.datePicker.date.startDate,
                  endDate: $scope.datePicker.date.endDate,
                  profitfrom: testmodel18.profitfrom,
                  profitto: testmodel18.profitto,
                  revenuefrom: testmodel18.revenuefrom,
                  revenueto: testmodel18.revenueto,
                  adspendfrom: testmodel18.adspendfrom,
                  adspendto: testmodel18.adspendto,
                  acosfrom: testmodel18.acosfrom,
                  acosto: testmodel18.acosto,
                  impressionsfrom: testmodel18.impressionsfrom,
                  impressionsto: testmodel18.impressionsto,
                  clicksfrom: testmodel18.clicksfrom,
                  clicksto: testmodel18.clicksto,
                  ctrfrom: testmodel18.ctrfrom,
                  ctrto: testmodel18.ctrto,
                  avecpcfrom: testmodel18.avecpcfrom,
                  avecpcto: testmodel18.avecpcto,
                  ordersFrom: testmodel18.ordersFrom,
                  ordersTo: testmodel18.ordersTo,
                  conversionRateFrom: testmodel18.conversionRateFrom,
                  conversionRateTo: testmodel18.conversionRateTo,
                  match1: testmodel18.match1,
                  order: 'DESC'
                })
                .then(function(response) {
                  $scope.belowacos = response;
                });
              break;
          }
        }

        $scope.modelload = function(j, i) {
          CampaignModel.loadmodel({
            user: $scope.user.id,
            id: i
          })
          .then(function(response) {
            eval('$scope.model' + j + ' =  response[0];');
          });
        };

        $scope.modelOptionsload = function(j, i) {
          CampaignModel.loadmodels({
            user: $scope.user.id,
            modelno: i
          })
          .then(function(response) {
            eval('$scope.modeloptions' + j + ' =  response;');
          });
        };

        $scope.modelclear = function(i) {
          eval('delete $scope.model' + i + ';');
          eval('$scope.model' + i + ' = {};');
        };

        $scope.modelsave = function(i, model) {
          CampaignModel.savemodel({
              user: $scope.user.id,
              name: model.name,
              profitfrom: model.profitfrom,
              profitto: model.profitto,
              revenuefrom: model.revenuefrom,
              revenueto: model.revenueto,
              adspendfrom: model.adspendfrom,
              adspendto: model.adspendto,
              acosfrom: model.acosfrom,
              acosto: model.acosto,
              impressionsfrom: model.impressionsfrom,
              impressionsto: model.impressionsto,
              clicksfrom: model.clicksfrom,
              clicksto: model.clicksto,
              ctrfrom: model.ctrfrom,
              ctrto: model.ctrto,
              avecpcfrom: model.avecpcfrom,
              avecpcto: model.avecpcto,
              ordersFrom: model.ordersFrom,
              ordersTo: model.ordersTo,
              conversionRateFrom: model.conversionRateFrom,
              conversionRateTo: model.conversionRateTo,
              modelno: i
            })
            .then(function(response) {
              MessageService.success('Model saved');
              $scope.modelOptionsload(18,i);
            });
        };

        $scope.currentAdGroup = null;

        $scope.adgroup = function(adg) {
          $scope.currentAdGroup = adg;
          $scope.ApplyModel(18, $scope.model18);
        };

        $scope.save_acos = function() {
          // Make actual data update
          CampaignModel
            .update_acos({
              user: $scope.user.id,
              campaign: $stateParams.campaign,
              acos: $scope.saveacos,
            })
            .then(function (kp_res) {
              if (typeof $scope.KPI.id === 'undefined' || $scope.KPI.id === null) {
                $scope.KPI.id = kp_res.insertId;
              }
              $scope.$parent.acos1 = $scope.saveacos;
              $scope.$parent.updateAcos();
              MessageService.success('ACoS updated successfully');
            });
        };

        $scope.options = {
          chart: {
            type: 'lineChart',
            height: 450,
            pointSize: 80,
            margin: {
              top: 20,
              right: 20,
              bottom: 50,
              left: 65
            },
            x: function(d) {
              if (d) {
                return d[0];
              }
            },
            y: function(d) {
              if (d) {
                return d[1];
              }
            },

            color: d3.scale.category10().range(),
            duration: 300,
            useInteractiveGuideline: true,
            clipVoronoi: false,
            // yDomain: [0, d3.max(function (d) { return d.v; }) ],
            xAxis: {
              axisLabel: 'Date',
              tickFormat: function(d) {
                return d3.time.format('%b %d')(new Date(d));
              }
            },
            yAxis: {
              axisLabel: 'Data',
              tickFormat: function(d) {
                return d3.format('.02f')(d);
              },
              axisLabelDistance: -10
            },
          }
        };

        // ------ BEGIN DATATABLE --------------

        $scope.$on('CURRENCY_UPDATED', function() {
          $scope.reloadDataTables();
        });

        $scope.dtInstances = {};

        $scope.reloadDataTables = function() {
          _.map($scope.dtInstances, function(_instance, type) {
            _instance.rerender();
          });
        };

        $scope.dtInstanceCallbackStart = function(_instance) {
          $scope.dtInstances.Start = _instance;
        };

        $scope.adClick = false;

        $scope.dtOptions_start = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('aaSorting', [
            [1, 'desc']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['start'])
          .withOption('pageLength', 10)
          .withButtons([{
              extend: 'copy',
              text: 'COPY',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              extend: 'excel',
              text: 'Excel',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            }
          ])
          .withOption("drawCallback", function(row, data) {
            var api = this.api(),
              data;
            $rootScope._dtSetting.save('start', api.context[0]._iDisplayLength);
            var pagesum = [];
            for (var i = 1; i <= 6; i++) {
              pagesum[i] = api.column(i, {
                page: 'current'
              }).data().reduce(function(a, b) {
                return Number.intVal(a) + Number.intVal(b);
              }, 0);

              var tbl1 = api.page.info();
              var fix = new Array(0, 2, 2, 0, 0, 2, 0);
              if (i == 2)
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], fix[i]));
              else if (i == 5)
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[2] / pagesum[4], fix[i]));
              else if (i == 1)
                $(api.column(i).footer()).html((pagesum[1] / (tbl1['recordsDisplay'] > 0 ? tbl1['recordsDisplay'] : 10)).toFixed(fix[i]).toLocaleString());
              else
                $(api.column(i).footer()).html(pagesum[i].toFixed(fix[i]).toLocaleString());
            }
          });

        // ------ END DATATABLE --------------
      }
    ]);
  }());
