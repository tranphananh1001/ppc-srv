(function () {
  'use strict';

  angular.module('frontend.ppc.product')
    .controller('productKeywordTrackingController', [
        '$scope', '$rootScope', '$state', '$stateParams', '$filter',
        'UserService', 'MessageService', '$http', 'HomeModel',
        'ProductModel', 'SettingsModel', 'CampaignModel', 'CampaignPerfomanceReportModel', 'DTOptionsBuilder', '$timeout',
        function controller($scope, $rootScope, $state, $stateParams, $filter,
                        UserService, MessageService, $http, HomeModel,
                        ProductModel, SettingsModel, CampaignModel, CampaignPerfomanceReportModel, DTOptionsBuilder, $timeout) {
        $scope.init = function() {
          $scope.datePicker = $scope.$parent.datePicker;
          $scope.dateRangeOptions = $scope.$parent.dateRangeOptions;
          $scope.product = null;

          $scope.initPageData();

          $scope.loadData();

          $scope.$on('EVENT_REFRESH', $scope.loadData);

          $scope.$watch('selectedKeyword', $scope.loadKeywordChartData, true);
          $scope.$on('PRODUCT_LOADED', function() { $scope.product = $scope.$parent.product; });
          $scope.$watch('currentTab', function() {
            if ($scope.zeroImpressionKeywords.length > 0 && $scope.currentTab == 'ZERO_IMPRESSIONS') {
              $scope.selectedKeyword = $scope.zeroImpressionKeywords[0].Keyword;
            }
            if ($scope.nonProfitableKeywords.length > 0 && $scope.currentTab == 'NON_PROFITABLE') {
              $scope.selectedKeyword = $scope.nonProfitableKeywords[0].Keyword;
            }
            if ($scope.profitableKeywords.length > 0 && $scope.currentTab == 'PROFITABLE') {
              $scope.selectedKeyword = $scope.profitableKeywords[0].Keyword;
            }
          });

          $scope.$on('CURRENCY_UPDATED', function() {
            $scope.reloadDataTables();
          });
      	};

        $scope.initPageData = function() {
            $scope.MODEL_NO_PROFITABLE = 1;
            $scope.MODEL_NO_NONPROFITABLE = 2;
            $scope.MODEL_NO_ZERO_IMPRESSIONS = 3;

            $scope.copiedKeywords = '';
            $scope.copiedKeywordsMatrix = [];

            $scope.profitableKeywords = [];
            $scope.nonProfitableKeywords = [];
            $scope.zeroImpressionKeywords = [];

            $scope.filterModelProfitableSearchTerms = {};
            $scope.filterModelNonProfitableSearchTerms = {};
            $scope.filterModelZeroImpressions = {};

            $scope.filterModelsProfitableSearchTerms = [];
            $scope.filterModelsNonProfitableSearchTerms = [];
            $scope.filterModelsZeroImpressions = [];

            $scope.loadFilterModels(null);

            $scope.selectedKeyword = null;

            $scope.currentTab = 'PROFITABLE';

            $scope.optionsKeywordChart = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    width: 900,
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
                    }
                }
            };

            $scope.dataKeywordChart = [{
                key: "Gross Revenue",
                mean: 250,
                values: []
            },  {
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

            $scope.dtInstances = {};

            $scope.dtOptionsProfitableKeywordsTable = DTOptionsBuilder.newOptions()
                .withScroller().withOption('scrollX', '100%').withOption('scrollY', 400)
                .withOption('aaSorting', [[1, 'desc']]).withButtons([])
                .withOption('lengthMenu', [10, 25, 50, 75, 100 ])
                .withOption("drawCallback", function(row, data){
                    var api = this.api(), data;
                    var pagesum = [];
                    for(var i=2;i<=8;i++){
                        pagesum[i] = api
                            .column(i, {page:'current'})
                            .data()
                            .reduce(function(a,b){
                                return Number.intVal(a)+Number.intVal(b);
                            }, 0);

                        if(i<=4)
                            $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
                        else if(i==5)
                            $(api.column(i).footer()).html((pagesum[4]/pagesum[3]*100).toFixed(1).toLocaleString());
                        else if(i==8)
                            $(api.column(i).footer()).html((pagesum[4]/pagesum[7]).toFixed(2).toLocaleString());
                        else
                            $(api.column(i).footer()).html(pagesum[i].toLocaleString());
                    }
                });
            $scope.dtOptionsNonProfitableKeywordsTable = DTOptionsBuilder.newOptions()
                .withScroller().withOption('scrollX', '100%').withOption('scrollY', 400)
                .withOption('aaSorting', [[1, 'desc']]).withButtons([])
                .withOption('lengthMenu', [10, 25, 50, 75, 100 ])
                .withOption("drawCallback", function(row, data){
                    var api = this.api(), data;
                    var pagesum = [];
                    for(var i=2;i<=8;i++){
                        pagesum[i] = api
                            .column(i, {page:'current'})
                            .data()
                            .reduce(function(a,b){
                                return Number.intVal(a)+Number.intVal(b);
                            }, 0);
                        if(i<=4)
                            $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
                        else if(i==5)
                            $(api.column(i).footer()).html((pagesum[4]/pagesum[3]*100).toFixed(1).toLocaleString());
                        else if(i==8)
                            $(api.column(i).footer()).html((pagesum[4]/pagesum[7]).toFixed(2).toLocaleString());
                        else
                            $(api.column(i).footer()).html(pagesum[i].toLocaleString());
                    }
                });

            $scope.dtOptionsZeroImpressionsKeywordsTable = DTOptionsBuilder.newOptions()
                .withScroller()
                .withOption('scrollX', '100%')
                .withOption('scrollY', 400)
                .withOption('aaSorting', [[1, 'asc']])
                .withOption('lengthMenu', [10, 25, 50, 75, 100 ]);

            $scope.copiedKeywords = {
                PROFITABLE: '',
                NON_PROFITABLE: '',
                ZERO_IMPRESSIONS: ''
            };
            $scope.copiedKeywordsMatrix = {
                PROFITABLE: [],
                NON_PROFITABLE: [],
                ZERO_IMPRESSIONS: []
            };
        };

        $scope.reloadDataTables = function() {
            _.map($scope.dtInstances, function(_instance, type) {
                _instance.rerender();
            });
        };

        $scope.dtInstanceCallbackProfitable = function(_instance) {
            $scope.dtInstances.Profitable = _instance;
        };
        $scope.dtInstanceCallbackNonProfitable = function(_instance) {
            $scope.dtInstances.NonProfitable = _instance;
        };

        $scope.copyKeywords = function (keywords, type) {
            $scope.copiedKeywordsMatrix[type] = [];

            for (var i = 0; i <= keywords.length - 1; i++) {
                $scope.copiedKeywordsMatrix[type].push(keywords[i].Keyword);
            }

            $scope.copiedKeywords[type] = $scope.copiedKeywordsMatrix[type].toString().replace(/,/g, '\n');
        };

        $scope.loadData = function() {
            $scope.loadProfitableKeywords();

            $scope.loadNonProfitableKeywords();

            $scope.loadZeroImpressionKeywords();
        };

        $scope.loadProfitableKeywords = function() {
            var filter = {};
            $rootScope.applyFilters1($scope.filterModelProfitableSearchTerms, filter, {
                user: $scope.user.id,
                id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                order: 'DESC'
            });

            ProductModel.customQuery(filter)
            .then(function (response) {
                $scope.profitableKeywords = response;
                if($scope.profitableKeywords.length > 0 && $scope.currentTab == 'PROFITABLE') $scope.selectedKeyword = $scope.profitableKeywords[0].Keyword;
            });
        };

        $scope.loadNonProfitableKeywords = function() {
            var filter = {};
            $rootScope.applyFilters1($scope.filterModelNonProfitableSearchTerms, filter, {
                user: $scope.user.id,
                id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                order: 'ASC'
            });

            ProductModel.customQuery(filter)
            .then(function (response) {
                $scope.nonProfitableKeywords = response;
                if($scope.nonProfitableKeywords.length > 0 && $scope.currentTab == 'NON_PROFITABLE') {
                  $scope.selectedKeyword = $scope.nonProfitableKeywords[0].Keyword;
                }
            });
        };

        $scope.loadZeroImpressionKeywords = function() {
            var filter = {};
            $rootScope.applyFilters1($scope.filterModelZeroImpressions, filter, {
                user: $scope.user.id,
                id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
            });

            ProductModel.getZeroImpressionKeywords(filter)
              .then(function (response) {
                  $scope.zeroImpressionKeywords = response;
                  if ($scope.zeroImpressionKeywords.length > 0 && $scope.currentTab == 'ZERO_IMPRESSIONS') {
                    $scope.selectedKeyword = $scope.zeroImpressionKeywords[0].Keyword;
                  }
              });
        };

        $scope.loadKeywordChartData = function() {
            if ($scope.selectedKeyword == null) {
               return;
            }

            ProductModel.getChartbyKeyword({
                user: $scope.user.id,
                keyword: $scope.selectedKeyword,
                id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate
            })
            .then(function (response) {
                _.each($scope.dataKeywordChart, function(item) {
                    item.values = [];
                });

                response.forEach(function (item, i, arr) {
                    var rr = new Date(item.EndDate);
                    $scope.dataKeywordChart[0].values.push([rr.getTime(), item.Revenue]);
                    $scope.dataKeywordChart[1].values.push([rr.getTime(), item.Revenue - item.Cost]);
                    $scope.dataKeywordChart[2].values.push([rr.getTime(), item.Cost]);
                    var nn = 0;
                    if (item.Revenue != 0) nn = item.Profit;
                    $scope.dataKeywordChart[3].values.push([rr.getTime(), nn]);
                });
            });
        };

        $scope.loadFilterModels = function(modelNo) {
            if(modelNo == null || modelNo == $scope.MODEL_NO_PROFITABLE) {
                CampaignModel.loadmodels({user: $scope.user.id, modelNo: $scope.MODEL_NO_PROFITABLE})
                    .then(function (response) {
                        $scope.filterModelsNonProfitableSearchTerms = response;
                    });
            }
            if(modelNo == null || modelNo == $scope.MODEL_NO_NONPROFITABLE) {
                CampaignModel.loadmodels({user: $scope.user.id, modelNo: $scope.MODEL_NO_NONPROFITABLE})
                    .then(function (response) {
                        $scope.filterModelsProfitableSearchTerms = response;
                    });
            }
            if(modelNo == null || modelNo == $scope.MODEL_NO_ZERO_IMPRESSIONS) {
                CampaignModel.loadmodels({user: $scope.user.id, modelNo: $scope.MODEL_NO_ZERO_IMPRESSIONS})
                    .then(function (response) {
                        $scope.filterModelsZeroImpressions = response;
                    });
            }
        };

        $scope.loadFilterModel = function(id, modelNo) {
            CampaignModel.loadmodel({
                user: $scope.user.id,
                id: id
            })
            .then(function (response) {
                if(modelNo == $scope.MODEL_NO_PROFITABLE) $scope.filterModelProfitableSearchTerms = response[0];
                else if(modelNo == $scope.MODEL_NO_NONPROFITABLE) $scope.filterModelNonProfitableSearchTerms = response[0];
                else if(modelNo == $scope.MODEL_NO_ZERO_IMPRESSIONS) $scope.filterModelZeroImpressions = response[0];
            });
        };

        $scope.saveFilterModel = function (model, modelNo) {
            var data = _.extend(model, {
                user: $scope.user.id,
                modelno: modelNo
            });
            CampaignModel.savemodel(data)
            .then(function (response) {
                MessageService.success('Model saved');

                $scope.loadFilterModels(modelNo);
            });
        };

        $scope.clearFilterModel = function(model) {
            _.each(model, function(val, key) {
                delete model[key];
            });
        };

        $scope.addKeyword = function(keyword, type) {
            var found = false;

            for (var i = $scope.copiedKeywordsMatrix[type].length - 1; i >= 0; i--) {
                if ($scope.copiedKeywordsMatrix[type][i] === keyword) {
                    $scope.copiedKeywordsMatrix[type].splice(i, 1);
                    found = true;
                }
            }

            if (!found) {
                $scope.copiedKeywordsMatrix[type].push(keyword)
            }

            $scope.copiedKeywords[type] = $scope.copiedKeywordsMatrix[type].toString().replace(/,/g, '\n');
        };

        $scope.changeKeyword = function(keyword) {
            $scope.selectedKeyword = keyword;
        };

        $scope.init();
    }]);
})();
