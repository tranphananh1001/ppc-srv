(function () {
    'use strict';

    // Controller to show single product on GUI.
    angular.module('frontend.ppc.product')
        .controller('ProductController', [
            '$scope', '$rootScope', '$state', '$stateParams',
            'UserService', 'MessageService', '$http', 'HomeModel',
            'ProductModel', 'SettingsModel', 'CampaignModel', 'CampaignPerfomanceReportModel', '$timeout',
            function controller($scope, $rootScope, $state, $stateParams,
                UserService, MessageService, $http, HomeModel,
                ProductModel, SettingsModel, CampaignModel, CampaignPerfomanceReportModel, $timeout) {

                $rootScope.initPage($scope);

                $scope.loadProduct = function() {
                    $scope.isHaveProduct = '';
                    ProductModel.getbyID({
                        user: $scope.user.id,
                        id: $stateParams.id,
                        startDate: $scope.datePicker.date.startDate,
                        endDate: $scope.datePicker.date.endDate
                    })
                    .then(function (response) {
                        if (response[0]) {
                            $scope.isHaveProduct = 'yes';
                            $scope.product = response[0];
                            $scope.$broadcast('PRODUCT_LOADED');
                        } else {
                             $scope.isHaveProduct = 'no';
                        }
                    })
                };

                $scope.checkProductIsSetup = function() {
                    ProductModel.checkProductIsSetup({
                        user: $scope.user.id,
                        product: $stateParams.id
                    })
                    .then(function (response) {
                        if(response[0].totalCount == 0) {
                            MessageService.error('This SKU has not been added to your plan yet. Go to the settings page and click on RESELECT SKU\'s to include this SKU.');
                        }
                    });
                };

                $scope.init = function() {
                    $scope.productId = $stateParams.id;

                    $scope.datePicker = {
                        date: {
                            startDate: moment().subtract(29, 'days'),
                            endDate: moment()
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
                            'apply.daterangepicker': function (a, b) {
                                $scope.$broadcast('EVENT_REFRESH');
                            }
                        }
                    };

                    $scope.checkProductIsSetup();

                    $scope.loadProduct();

                    $timeout(function() {
                        $('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
                            setTimeout(function() {
                                $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
                            }, 100);
                        } );
                    }, 500);
                };

                $scope.init();
        }]);
}());
