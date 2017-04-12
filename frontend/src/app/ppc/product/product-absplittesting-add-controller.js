(function () {
  'use strict';

  angular.module('frontend.ppc.product')
    .controller('productAbSplitTestingAddController', [
        '$scope', '$rootScope', '$state', '$stateParams',
        'UserService', 'MessageService', '$http', 'HomeModel',
        'ProductModel', 'SettingsModel', 'CampaignModel', 'CampaignPerfomanceReportModel', 'DTOptionsBuilder', '$timeout',
        function controller($scope, $rootScope, $state, $stateParams,
                        UserService, MessageService, $http, HomeModel,
                        ProductModel, SettingsModel, CampaignModel, CampaignPerfomanceReportModel, DTOptionsBuilder, $timeout) {
        $scope.init = function() {
          $scope.datePicker = $scope.$parent.datePicker;
          $scope.dateRangeOptions = $scope.$parent.dateRangeOptions;
          $scope.product = null;

          $scope.initPageData();

          $scope.loadData();

          $scope.$on('EVENT_REFRESH', $scope.loadData);
          $scope.$on('PRODUCT_LOADED', function() {
            scope.product = $scope.$parent.product;
          });
        };

        $scope.initPageData = function() {
            // clear everyting
            delete $scope.abtests;
            delete $scope.show;

            $scope.abtests = {};
            $scope.show = {};
            $scope.abtests.before_timeframe = 14;

            $scope.categories = [
                {id: 0, name: "Select a field..."},
                {id: 1, name: "Title"},
                {id: 2, name: "Summary"},
                {id: 3, name: "Photos"},
                {id: 4, name: "Bullets"},
                {id: 5, name: "Backend keywords"},
                {id: 6, name: "Price"},
                {id: 7, name: "Discount"},
                {id: 8, name: "Coupon"}
            ];

            $scope.itemSelected = $scope.categories[0];

            $scope.chartOptions = {
              chart: {
                type: 'pieChart',
                height: 500,
                width: 300,
                x: function (d) {
                  return d.key;
                },
                y: function (d) {
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
        };

        $scope.loadData = function() {
            $scope.loadProductTestingData();
            $scope.loadPieChartData();
        };

        $scope.loadPieChartData = function() {
            HomeModel.getpiechart({
                user: $scope.user.id, id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate
            }).then(function (response) {
                $scope.dataChart = [{
                    key: "Organic Profit",
                    y: response[0].Profit1 - response[0].Profit
                }, {
                    key: "PPC Profit",
                    y: response[0].Profit
                }];
            });
        };

        $scope.loadProductTestingData = function() {
            ProductModel.gettopKPI({
                user: $scope.user.id,
                id: $scope.$parent.productId,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate
            })
            .then(function (response) {
                $scope.KPI = response[0];

                $scope.uprevenue = $scope.KPI.Revenue;
                $scope.uporders = $scope.KPI.Orders;
                $scope.upcost = $scope.KPI.Cost;
                $scope.upacos = $scope.KPI.Cost / $scope.KPI.Revenue * 100;
                $scope.upcpc = $scope.KPI.Cost / $scope.KPI.Clicks;
                $scope.upimpressions = $scope.KPI.Impressions;
                $scope.upctr = $scope.KPI.Clicks / $scope.KPI.Impressions * 100;
                $scope.upclicks = $scope.KPI.Clicks;
                $scope.upcr = $scope.KPI.Orders / $scope.KPI.Clicks * 100;

                $scope.upprofit = $scope.KPI.Profit;
            });
        };

        $scope.onCategoryChange = function (category) {
            $scope.show = {};
            switch ($scope.itemSelected.id) {
                case 1: $scope.show.ti = 1; break;
                case 2: $scope.show.su = 1; break;
                case 3: $scope.show.ph = 1; break;
                case 4: $scope.show.bu = 1; break;
                case 5: $scope.show.ba = 1; break;
                case 6: $scope.show.pr = 1; break;
                case 7: $scope.show.di = 1; break;
                case 8: $scope.show.co = 1; break;
            }
            $scope.show.bt = 1;
        };

        $scope.save_test = function () {
            // check for required fields
            if (typeof $scope.abtests.name !== 'undefined' && $scope.abtests.name !== null) {
                if (typeof $scope.show === 'undefined' || $scope.show === null) {
                    $scope.show = {};
                }

                var item = _.extend(_.pick($scope.abtests, 'before_backend1', 'before_backend2', 'before_backend3', 'before_backend4', 'before_backend5', 'before_bullet1', 'before_bullet2', 'before_bullet3', 'before_bullet4', 'before_bullet5', 'before_coupon', 'before_discount', 'before_photo1', 'before_photo2', 'before_photo3', 'before_photo4', 'before_photo5', 'before_photo6', 'before_photo7', 'before_photo8', 'before_photo9', 'before_price', 'before_summary', 'after_backend1', 'after_backend2', 'after_backend3',' after_backend4', 'after_backend5', 'after_bullet1', 'after_bullet2', 'after_bullet3', 'after_bullet4', 'after_bullet5', 'after_coupon', 'after_discount', 'after_photo1', 'after_photo2','after_photo3', 'after_photo4', 'after_photo5', 'after_photo6', 'after_photo7', 'after_photo8', 'after_photo9', 'after_price', 'after_summary', 'after_summary', 'name', 'before_timeframe'), {user: $scope.user.id,
                    sku: $scope.product.sku});

                ProductModel.savenewtest(item)
                    .then(function (response) {
                        MessageService.success('Test saved');
                        $scope.show = {
                            save: true,
                        };
                        $scope.dtInstance.rerender();
                    });
            } else {
                MessageService.error('Test name required');
            }
        };

        $scope.test_show = function (id) {
            // clear everyting
            delete $scope.abtests;
            delete $scope.show;

            $scope.abtests = {};
            $scope.show = {};

            ProductModel
            .gettestbyID({user: $scope.user.id, id: id})
            .then(function (response) {
                $scope.abtests = response[0];
                $scope.show.sav = true;
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var firstDate = new Date($scope.abtests.to_date);
                var secondDate = new Date();
                var secondDate1 = new Date($scope.abtests.from_date);

                $scope.abtests.before_timeframe = Math.round(((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                $scope.abtests.before_timeframe1 = Math.round(((secondDate1.getTime() - firstDate.getTime()) / (oneDay)));

                ProductModel.getabtestsstats({
                    user: $scope.user.id, id: $scope.$parent.productId,
                    startDate: moment($scope.abtests.from_date).add($scope.abtests.before_timeframe1,'days'),
                    endDate: moment($scope.abtests.from_date)
                }).then(function (Before_response) {
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

                ProductModel.getabtestsstats({
                    user: $scope.user.id, id: $scope.$parent.productId,
                    startDate: moment($scope.abtests.from_date),
                    endDate: moment($scope.abtests.to_date)
                }).then(function (Before_response) {
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

        $scope.uploadFile = function (a, files) {
            var fd = new FormData();
            //Take the first selected file
            fd.append("0", files[0]);

            $http.post('http://138.201.121.240:1337/api/uploadphoto', fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).success(function (data) {
                    $scope.abtests[a] = data.files[0].fd;
                    MessageService.success('Picture uploaded.');
                }
            ).error();
        };

        $scope.init();
    }]);
})();
