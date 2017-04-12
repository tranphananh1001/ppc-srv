(function () {
    'use strict';

    angular.module('frontend.ppc.home')
        .controller('HomeController', ['$rootScope', '$scope', '$state', '$stateParams',
            'UserService', 'MessageService', 'HomeModel', 'CampaignModel','CampaignLogModel', 'SettingsModel',
            'ListConfig', 'SocketHelperService', 'DTOptionsBuilder', '$timeout', '$filter',
            function ($rootScope, $scope, $state, $stateParams,
                UserService, MessageService, HomeModel, CampaignModel, CampaignLogModel, SettingsModel,
                ListConfig, SocketHelperService, DTOptionsBuilder, $timeout, $filter) {

                $rootScope.initPage($scope);
                $scope.init = function() {
                    $scope.initPageData();

                    $scope.loadData();

                    $scope.$on('CURRENCY_UPDATED', function() {
                        $scope.reloadDataTables();
                    });
                };

                $scope.initPageData = function() {
                    $scope.centerId = $stateParams.centerId;
                    $scope.MODEL_NO_HOME_CAMPAIGNS = 4;
                    $scope.MODEL_NO_HOME_SKUS = 5;

                    $scope.loadFilterModels(null);

                    $scope.datePicker = {
                        date: {
                            startDate: moment().subtract(37, 'days'),
                            endDate: moment().subtract(7, 'days'),
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
                            'apply.daterangepicker': function () {
                                $scope.loadData();
                            }
                        }
                    };

                    $scope.optionsPieChart = {
                        chart: {
                            type: 'pieChart',
                            height: 500,
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
                            color: d3.scale.category10().range(),
                            duration: 300,
                            useInteractiveGuideline: true,
                            clipVoronoi: false,
                            xAxis: {
                                axisLabel: 'Date',
                                tickFormat: function (d) { return d3.time.format('%b %d')(new Date(d)); }
                            },
                            yAxis: {
                                axisLabel: 'Data',
                                tickFormat: function (d) {
                                  return Math.round(d);
                                },
                                axisLabelDistance: -10
                            }
                        }
                    };

                    $scope.dataLineChart = [{
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
                    }, {
                        key: "Orders",
                        mean: 250,
                        values: []
                    }];

                    $scope.filterModelCampaign = {};
                    $scope.filterModelSKU = {};

                    $scope.filterModelsCampaigns = [];
                    $scope.filterModelsSKUs = [];

                    $scope.dtInstances = {};

                    $scope.dtOptionsCampaigns = DTOptionsBuilder.newOptions()
                        .withScroller()
                        .withOption('scrollX', '100%')
                        .withOption('scrollY', 400)
                        .withOption('aaSorting', [[1, 'desc']]).withOption('lengthMenu', [10, 25, 50, 75, 100 ])
                        .withOption('iDisplayLength', 10)
                        .withOption("drawCallback", function(row, data){
                            $scope.calcFooter(this.api(), 'Campaign');
                    });

                    $scope.dtOptionsSKUs = DTOptionsBuilder.newOptions()
                        .withScroller()
                        .withOption('scrollX', '100%')
                        .withOption('scrollY', 400)
                        .withOption('aaSorting', [[1, 'desc']]).withOption('lengthMenu', [10, 25, 50, 75, 100 ])
                        .withOption('iDisplayLength', 10)
                        .withOption("drawCallback", function(row, data){
                            $scope.calcFooter(this.api(), 'SKU');
                        });
                };

                $scope.calcFooter = function(api, type) {
                    var pagesum = [];
                    if(type == 'SKU') {
                        for(var i=1;i<=8;i++){
                            if(i==2) continue;
                            pagesum[i] = api
                                .column(i, {page:'current'})
                                .data()
                                .reduce(function(a,b){
                                    return Number.intVal(a)+Number.intVal(b);
                                }, 0);
                            if(i<=4)
                                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
                            if(i==5)
                                $(api.column(i).footer()).html((pagesum[4]/pagesum[3]*100).toFixed(1).toLocaleString());
                            if(i>5)
                                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
                        }
                    }
                    else if(type == 'Campaign') {
                        for(var i=1;i<=8;i++){
                            pagesum[i] = api
                                .column(i, {page:'current'})
                                .data()
                                .reduce(function(a,b){
                                    return Number.intVal(a)+Number.intVal(b);
                                }, 0);
                            var page = api.page.info();
                            if(i<=3)
                                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
                            if(i==4)
                                $(api.column(i).footer()).html((pagesum[3]/pagesum[2]*100).toFixed(1).toLocaleString());
                            if(i>4){
                                if(i==7)
                                    $(api.column(i).footer()).html((pagesum[3]/pagesum[6]).toFixed(2).toLocaleString());
                                else
                                    $(api.column(i).footer()).html(pagesum[i].toLocaleString());
                            }
                        }
                    }
                };

                $scope.reloadDataTables = function() {
                    _.map($scope.dtInstances, function(_instance, type) {
                        _instance.rerender();
                    });
                };

                $scope.dtInstanceCallbackSKU = function(_instance) {
                    $scope.dtInstances.SKU = _instance;
                };
                $scope.dtInstanceCallbackCampaign = function(_instance) {
                    $scope.dtInstances.Campaign = _instance;
                };

                $scope.loadData = function() {
                    $scope.loadPieChartData();

                    $scope.loadLineChartData();

                    $scope.loadCampaignData();

                    $scope.loadSKUData();

                    $scope.loadTopKPIData();
                };

                $scope.loadPieChartData = function () {
                    HomeModel.getpiechart({
                        user: $scope.user.id,
                        startDate: $scope.datePicker.date.startDate,
                        endDate: $scope.datePicker.date.endDate
                    }).then(function (response) {
                        $scope.trueAcos = (response[0].Revenue + response[0].Revenue1)/response[0].Cost;
                        $scope.dataPieChart = [{
                            key: "Organic Revenue",
                            y: response[0].Revenue1 - response[0].Revenue
                        }, {
                            key: "PPC Revenue",
                            y: response[0].Revenue
                        }];
                    });
                };

                $scope.loadLineChartData = function() {
                    HomeModel
                        .getChart({
                            user: $scope.user.id,
                            startDate: $scope.datePicker.date.startDate,
                            endDate: $scope.datePicker.date.endDate})
                        .then(function (response) {
                            _.each($scope.dataLineChart, function(item) {
                                item.values = [];
                            });

                            response.forEach(function (item, i, arr) {
                                var rr = new Date(item.EndDate).getTime();
                                $scope.dataLineChart[0].values.push({x: rr, y: item.Revenue});
                                $scope.dataLineChart[1].values.push({x: rr, y: item.Revenue - item.Cost});
                                $scope.dataLineChart[2].values.push({x: rr, y: item.Cost});
                                var nn = 0;
                                if (item.Revenue != 0) {
                                  nn = item.Profit;
                                }
                                $scope.dataLineChart[3].values.push({x: rr, y: nn});
                                $scope.dataLineChart[4].values.push({x: rr, y: item.Orders});
                            });
                        });
                };

                $scope.loadCampaignData = function() {
                    var filter = {};
                    $rootScope.applyFilters1($scope.filterModelCampaign, filter, {
                        user: $scope.user.id,
                        startDate: $scope.datePicker.date.startDate,
                        endDate: $scope.datePicker.date.endDate
                    });
                    HomeModel
                        .gettopCampaigns(filter)
                        .then(function (response) {
                            $scope.topCampaigns = response;
                            $scope.loadCampaignLogData();
                        });
                };

                $scope.loadCampaignLogData = function() {
                    $scope.campaignLogs = [];
                    CampaignLogModel.loadon({
                        user: $scope.user.id
                    }).then(function (result) {
                        for(var i=0;i<result.length;i++) {
                            $scope.campaignLogs[result[i].campaign_id] = result[i];
                        }

                        for(i=0;i<$scope.topCampaigns.length;i++){
                            var campaign_id = $scope.topCampaigns[i].CampaignId;
                            if($scope.campaignLogs[campaign_id]){
                                 $scope.campaignLogs[campaign_id];
                                 if(moment().diff($scope.campaignLogs[campaign_id].createdAt,"days") > 30){
                                    $scope.topCampaigns[i].GREEN = true;
                                    $scope.topCampaigns[i].YELLOW = false;
                                }else{
                                    $scope.topCampaigns[i].GREEN = false;
                                    $scope.topCampaigns[i].YELLOW = true;
                                }
                            }
                        }
                    });
                };

                $scope.loadSKUData = function() {
                    var filter = {};
                    $rootScope.applyFilters1($scope.filterModelSKU, filter, {
                        user: $scope.user.id,
                        startDate: $scope.datePicker.date.startDate,
                        endDate: $scope.datePicker.date.endDate
                    });
                    HomeModel
                        .gettopSKU(filter)
                        .then(function (response) {
                            $scope.topSKU = response;
                        });
                };

                $scope.loadTopKPIData = function() {
                    HomeModel.gettopKPI({user: $scope.user.id, startDate: $scope.datePicker.date.startDate, endDate: $scope.datePicker.date.endDate})
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
                        });
                };

                $scope.loadFilterModels = function(modelNo) {
                    if(modelNo == null || modelNo == $scope.MODEL_NO_HOME_CAMPAIGNS) {
                        CampaignModel.loadmodels({user: $scope.user.id, modelNo: $scope.MODEL_NO_HOME_CAMPAIGNS})
                            .then(function (response) {
                                $scope.filterModelsCampaigns= response;
                            });
                    }
                    if(modelNo == null || modelNo == $scope.MODEL_NO_HOME_SKUS) {
                        CampaignModel.loadmodels({user: $scope.user.id, modelNo: $scope.MODEL_NO_HOME_SKUS})
                            .then(function (response) {
                                $scope.filterModelsSKUs = response;
                            });
                    }
                };

                $scope.loadFilterModel = function(id, modelNo) {
                    CampaignModel.loadmodel({
                        user: $scope.user.id,
                        id: id
                    })
                    .then(function (response) {
                        if(modelNo == $scope.MODEL_NO_HOME_CAMPAIGNS) $scope.filterModelCampaign = response[0];
                        else if(modelNo == $scope.MODEL_NO_HOME_SKUS) $scope.filterModelSKU = response[0];
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

                $scope.init();
            }]);
}());
