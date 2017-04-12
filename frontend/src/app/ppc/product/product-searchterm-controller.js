(function () {
  'use strict';

  angular.module('frontend.ppc.product')
    .controller('productSearchTermController', [
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

          $scope.$on('PRODUCT_LOADED', function() { $scope.product = $scope.$parent.product; });
      	};

        $scope.initPageData = function() {
            $scope.backend = undefined;

            $scope.dtOptionsBackend = DTOptionsBuilder.newOptions().withScroller()
              .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [[1, 'desc']]).withButtons([]);
        };

        $scope.loadData = function() {
            ProductModel.getbackend({user: $scope.user.id, id: $scope.$parent.productId})
            .then(function (response) {
                $scope.backend = response;
            });
        };

        $scope.update_backend = function () {
            var update_backend = ProductModel.update_backend({
                user: $scope.user.id,
                id: $scope.$parent.productId,
                backend1: $scope.product.backend_keywords1,
                backend2: $scope.product.backend_keywords2,
                backend3: $scope.product.backend_keywords3,
                backend4: $scope.product.backend_keywords4,
                backend5: $scope.product.backend_keywords5
            })
            .then(function () {
                MessageService.success('Saved.');
            });
        };

        $scope.removenumbers = function () {
            for (var i = $scope.backend.length - 1; i >= 0; i--) {
                if ($scope.backend[i][0].match(/\d+/g) != null) {
                    $scope.backend.splice(i, 1);
                }
            }
        };

        $scope.removepopularity = function () {
            for (var i = $scope.backend.length - 1; i >= 0; i--) {
                if ($scope.backend[i][1] == 1) {
                    $scope.backend.splice(i, 1);
                }
            }
        };


        $scope.add_backend = function () {
            var i = 0;
            for (var j = 0; j < $scope.backend.length * 10000; j++) {
                if (typeof  $scope.product.backend_keywords1 === 'undefined' || !$scope.product.backend_keywords1 || $scope.product.backend_keywords1.length < 1000 - $scope.backend[i][0].length) {
                    if (typeof  $scope.product.backend_keywords1 === 'undefined' || !$scope.product.backend_keywords1) $scope.product.backend_keywords1 = $scope.backend[i][0];
                    else $scope.product.backend_keywords1 += ' ' + $scope.backend[i][0];
                        $scope.backend.splice(i, 1);

                }
                else {
                    if (typeof  $scope.product.backend_keywords2 === 'undefined' || !$scope.product.backend_keywords2 || $scope.product.backend_keywords2.length < 1000 - $scope.backend[i][0].length) {
                        if (typeof  $scope.product.backend_keywords2 === 'undefined' || !$scope.product.backend_keywords2) $scope.product.backend_keywords2 = $scope.backend[i][0];
                        else $scope.product.backend_keywords2 += ' ' + $scope.backend[i][0];
                            $scope.backend.splice(i, 1);
                    } else {
                        if (typeof  $scope.product.backend_keywords3 === 'undefined' || !$scope.product.backend_keywords3 || $scope.product.backend_keywords3.length < 1000 - $scope.backend[i][0].length) {
                            if (typeof  $scope.product.backend_keywords3 === 'undefined' || !$scope.product.backend_keywords3) $scope.product.backend_keywords3 = $scope.backend[i][0];
                            else $scope.product.backend_keywords3 += ' ' + $scope.backend[i][0];
                                $scope.backend.splice(i, 1);
                        } else {
                            if (typeof  $scope.product.backend_keywords4 === 'undefined' || !$scope.product.backend_keywords4 || $scope.product.backend_keywords4.length < 1000 - $scope.backend[i][0].length) {
                                if (typeof  $scope.product.backend_keywords4 === 'undefined' || !$scope.product.backend_keywords4) $scope.product.backend_keywords4 = $scope.backend[i][0];
                                else $scope.product.backend_keywords4 += ' ' + $scope.backend[i][0];
                                    $scope.backend.splice(i, 1);
                            } else {
                                if (typeof  $scope.product.backend_keywords5 === 'undefined' || !$scope.product.backend_keywords5 || $scope.product.backend_keywords5.length < 1000 - $scope.backend[i][0].length) {
                                    if (typeof  $scope.product.backend_keywords5 === 'undefined' || !$scope.product.backend_keywords5) $scope.product.backend_keywords5 = $scope.backend[i][0];
                                    else $scope.product.backend_keywords5 += ' ' + $scope.backend[i][0];
                                        $scope.backend.splice(i, 1);
                                } else {
                                    MessageService.success('No more space. Stopped');
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            var backendKeywordStr = $scope.product.backend_keywords1;
            var replacedString = backendKeywordStr.replace(/,/g, '');
            var newArr = replacedString.split(' ');

            //remove duplicate search terms
            $scope.product.backend_keywords1 = removeDuplicateSearchTerm(newArr).join(' ');
            MessageService.success('All keywords were added to backend');
        };

        function removeDuplicateSearchTerm(arr) {
          var upperCaseArr = [];
          arr.map(function(item) {
            if (item === item.toUpperCase()) {
              upperCaseArr.push(item);
            }
          });

          if (upperCaseArr.length === 0) return arr;

          var lowerCaseArr = arr.filter(function(item) {
            return item !== item.toUpperCase();
          });

          //Get unique remain elements
          var remainElesArr = [];
          upperCaseArr.map(function(item){
            if (arr.indexOf(item.toLowerCase()) === -1) {
              remainElesArr.push(item);
            }
          })

          return lowerCaseArr.concat(remainElesArr);
        }


        $scope.init();
    }]);
})();
