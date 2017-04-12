(function() {
  'use strict';

  angular.module('frontend.ppc.product')
    .controller('productStartController', [
      '$scope', '$rootScope', '$state', '$stateParams', '$filter',
      'UserService', 'MessageService', '$http', 'HomeModel', 'NegateLogModel',
      'ProductModel', 'SettingsModel', 'CampaignModel', 'CampaignPerfomanceReportModel', 'DTOptionsBuilder', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, $filter,
        UserService, MessageService, $http, HomeModel, NegateLogModel,
        ProductModel, SettingsModel, CampaignModel, CampaignPerfomanceReportModel, DTOptionsBuilder, $timeout) {
        $scope.init = function() {
          $scope.datePicker = $scope.$parent.datePicker;
          $scope.dateRangeOptions = $scope.$parent.dateRangeOptions;
          $scope.product = null;
          $scope.initChartConfigurations();

          $scope.initCampaignListTable();

          $scope.loadData();

          $scope.$on('EVENT_REFRESH', $scope.loadData);
          $scope.$on('PRODUCT_LOADED', function() {
            $scope.product = $scope.$parent.product;

            NegateLogModel.find({
              'sku' : $scope.product.sku,
              'user' : $scope.user.id
            }).then(function (result) {
              if (result && result != null ) {
                $scope.negExactList = '';
                $scope.negPhraseList = '';
                result.forEach(function(item){
                  if (item.keywordType == 0) {
                    $scope.negExactList = item.keywords;
                  } else {
                    $scope.negPhraseList = item.keywords;
                  }
                });
                $scope.negExactList = $scope.negExactList.toString().replace(/,/g, '\n');
                $scope.negPhraseList = $scope.negPhraseList.toString().replace(/,/g, '\n');
              }
            });
          });
          $scope.$on('CURRENCY_UPDATED', function() {
            $scope.reloadDataTables();
          });
        };

        $scope.initCampaignListTable = function() {
          $scope.dtInstances = {};

          $scope.dtOptionsCampaignList = DTOptionsBuilder
            .newOptions()
            .withScroller()
            .withOption('scrollX', '100%')
            .withOption('scrollY', 400)
            .withOption('aaSorting', [[1, 'desc']])
            .withButtons([])
            .withOption("drawCallback", function(row, data) {
              var api = this.api(), data;
              var pagesum = [];
              for(var i = 1; i <= 8; i++) {
                pagesum[i] = api
                  .column(i, {page:'current'})
                  .data()
                  .reduce(function(a,b){ return Number.intVal(a)+Number.intVal(b); }, 0);

                if(i<=3) {
                  $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
                }
                if(i==4) {
                  $(api.column(i).footer()).html((pagesum[3]/pagesum[2]*100).toFixed(1).toLocaleString());
                }
                if(i>4) {
                  if(i==7) {
                    $(api.column(i).footer()).html((pagesum[3]/pagesum[6]).toFixed(2).toLocaleString());
                  } else {
                    $(api.column(i).footer()).html(pagesum[i].toLocaleString());
                  }
                }
              }
            });
        };

        $scope.reloadDataTables = function() {
          _.map($scope.dtInstances, function(_instance, type) {
            _instance.rerender();
          });
        };

        $scope.dtInstanceCallbackCampaign = function(_instance) {
          $scope.dtInstances.Campaign = _instance;
        };


        $scope.loadData = function() {
          $scope.loadTopKPI();

          $scope.loadPieChartData();

          $scope.loadLineChartData();

          $scope.loadCampaignsList();
        };

        $scope.initChartConfigurations = function() {
          $scope.optionsPieChart = {
            chart: {
              type: 'pieChart',
              height: 500,
              width: 300,
              x: function(d) {
                return d.key;
              },
              y: function(d) {
                return d.y;
              },
              showLabels: true,
              labelType: 'percent',
              duration: 500,
              labelThreshold: 0.01,
              labelSunbeamLayout: true,
              legend: {
                margin: {
                  top: 5,
                  right: 35,
                  bottom: 5,
                  left: 0
                }
              }
            }
          };

          $scope.optionsLineChart = {
            chart: {
              type: 'lineChart',
              height: 450,
              margin: {
                top: 20,
                right: 20,
                bottom: 50,
                left: 65
              },
              x: function(d) {
                return d[0];
              },
              y: function(d) {
                return d[1];
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

          $scope.dataLineChart = [{
            key: "Gross Revenue",
            mean: 250,
            values: []
          }, {
            key: "Net Revenue",
            mean: 250,
            values: []
          }, {
            key: "Ad Spend",
            mean: 250,
            values: []
          }, {
            key: "Profit",
            mean: 250,
            values: []
          }];
        };

        $scope.loadPieChartData = function() {
          HomeModel.getpiechart({
            user: $scope.user.id,
            id: $scope.$parent.productId
          }).then(function(response) {
            $scope.trueAcos = response[0].Revenue + response[0].Revenue1;
            $scope.dataPieChart = [{
              key: "Organic Profit",
              y: response[0].Profit1 - response[0].Profit
            }, {
              key: "PPC Profit",
              y: response[0].Profit
            }];
          });
        };

        $scope.loadLineChartData = function() {
          ProductModel.getChart({
              user: $scope.user.id,
              id: $scope.$parent.productId,
              startDate: $scope.datePicker.date.startDate,
              endDate: $scope.datePicker.date.endDate
            })
            .then(function(response) {

              // reset data array
              _.each($scope.dataLineChart, function(item) {
                item.values = [];
              });

              response.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);
                $scope.dataLineChart[0].values.push([rr.getTime(), item.Revenue]);
                $scope.dataLineChart[1].values.push([rr.getTime(), item.Revenue - item.Cost]);
                $scope.dataLineChart[3].values.push([rr.getTime(), item.Revenue != 0 ? item.Profit : 0]);
                $scope.dataLineChart[2].values.push([rr.getTime(), item.Cost]);
              });

            });
        };

        $scope.loadCampaignsList = function() {
          ProductModel.searchbyACoSmult({
              user: $scope.user.id,
              id: $scope.$parent.productId,
              startDate: $scope.datePicker.date.startDate,
              endDate: $scope.datePicker.date.endDate
            })
            .then(function(response) {
              $scope.campaingsList = response;
            });
        };

        $scope.loadData = function() {
          $scope.loadTopKPI();
          $scope.loadPieChartData();
          $scope.loadLineChartData();
          $scope.loadCampaignsList();
        };

        $scope.initChartConfigurations = function() {
          $scope.optionsPieChart = {
            chart: {
              type: 'pieChart',
              height: 500,
              width: 300,
              x: function (d) { return d.key; },
              y: function (d) { return d.y; },
              showLabels: true,
              labelType: 'percent',
              duration: 500,
              labelThreshold: 0.01,
              labelSunbeamLayout: true,
              legend: { margin: { top: 5, right: 35, bottom: 5, left: 0 } }
            }
          };

          $scope.optionsLineChart = {
            chart: {
              type: 'lineChart',
              height: 450,
              margin: { top: 20, right: 20, bottom: 50, left: 65 },
              x: function (d) { return d[0]; },
              y: function (d) { return d[1]; },
              color: d3.scale.category10().range(),
              duration: 300,
              useInteractiveGuideline: true,
              clipVoronoi: false,
              // yDomain: [0, d3.max(function (d) { return d.v; }) ],
              xAxis: {
                axisLabel: 'Date',
                tickFormat: function (d) { return d3.time.format('%b %d')(new Date(d)); }
              },
              yAxis: {
                axisLabel: 'Data',
                tickFormat: function (d) { return d3.format('.02f')(d); },
                axisLabelDistance: -10
              },
            }
          };

          $scope.dataLineChart = [{
            key: "Gross Revenue",
            mean: 250,
            values: []
          }, {
            key: "Net Revenue",
            mean: 250,
            values: []
          }, {
            key: "Ad Spend",
            mean: 250,
            values: []
          }, {
            key: "Profit",
            mean: 250,
            values: []
          }];
        };

        $scope.loadPieChartData = function() {
          HomeModel.getpiechart({
            user: $scope.user.id, id: $scope.$parent.productId
          }).then(function (response) {
            $scope.trueAcos = response[0].Revenue + response[0].Revenue1;
            $scope.dataPieChart = [{
              key: "Organic Profit",
              y: response[0].Profit1 - response[0].Profit
            }, {
              key: "PPC Profit",
              y: response[0].Profit
            }];
          });
        };

        $scope.loadLineChartData = function() {
          ProductModel.getChart({
            user: $scope.user.id,
            id: $scope.$parent.productId,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate
          })
          .then(function (response) {
            // reset data array
            _.each($scope.dataLineChart, function(item) {
              item.values = [];
            });

            response.forEach(function (item, i, arr) {
              var rr = new Date(item.EndDate);
              $scope.dataLineChart[0].values.push([rr.getTime(), item.Revenue]);
              $scope.dataLineChart[1].values.push([rr.getTime(), item.Revenue - item.Cost]);
              $scope.dataLineChart[3].values.push([rr.getTime(), item.Revenue != 0 ? item.Profit : 0]);
              $scope.dataLineChart[2].values.push([rr.getTime(), item.Cost]);
            });
          });
        };

        $scope.loadCampaignsList = function() {
          ProductModel.searchbyACoSmult({
            user: $scope.user.id,
            id: $scope.$parent.productId,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate
          })
          .then(function (response) {
            $scope.campaingsList = response;
          });
        };

        $scope.loadTopKPI = function() {
          ProductModel.gettopKPI({
            user: $scope.user.id,
            id: $scope.$parent.productId,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate
          })
          .then(function (response) {
            $scope.uprevenue = response[0].Revenue == null ? 0 : response[0].Revenue;
            $scope.upcost = response[0].Cost == null ? 0 : response[0].Cost;
            $scope.uporders = response[0].Orders == null ? 0 : response[0].Orders;
            $scope.upclicks = response[0].Clicks == null ? 0 : response[0].Clicks;
            $scope.upprofit = response[0].Profit == null ? 0 : response[0].Profit;
            $scope.upacos = isNaN(response[0].Cost / response[0].Revenue * 100) ? 0 : response[0].Cost / response[0].Revenue * 100;
            $scope.upcpc = isNaN(response[0].Cost / response[0].Clicks) ? 0 : response[0].Cost / response[0].Clicks;
            $scope.upimpressions = response[0].Impressions == null ? 0 : response[0].Impressions;
            $scope.upctr = isNaN(response[0].Clicks / response[0].Impressions * 100) ? 0 : response[0].Clicks / response[0].Impressions * 100;
            $scope.upcr = isNaN(response[0].Orders / response[0].Clicks * 100) ? 0 : response[0].Orders / response[0].Clicks * 100;

            $scope.upprofit = response[0].Profit;
          });
        };

        $scope.save_product = function () {
          ProductModel
            .update_margins(angular.copy($scope.product))
            .then(function onSuccess() {
              MessageService.success('Product "' + $scope.product["product-name"] + '" updated successfully');
            });
        };

        $scope.init();
  }]);
})();
