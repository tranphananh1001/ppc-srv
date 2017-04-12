(function () {
  'use strict';
  // Controller which contains all necessary logic for product list GUI on boilerplate application.
  var ProductListController = function ($scope, $rootScope, UserService, ProductModel, DTOptionsBuilder, SettingsModel, $timeout) {
    $rootScope.initPage($scope);

    $scope.init = function() {
      $scope.dtOptions = $scope.dtOptions_search_neg = DTOptionsBuilder.newOptions()
        .withScroller().withOption('scrollX', '100%').withOption('scrollY', 400)
        .withOption('lengthMenu', [[10,25,50,100,-1], [10,25,50,100,'All']])
        .withOption('aaSorting', [[1, 'desc']])
        .withOption('pageLength', $rootScope._dtSetting.length['key_main'])
        .withOption("drawCallback", function(row, data){
          $rootScope._dtSetting.save('key_main', this.api().context[0]._iDisplayLength);
        });

      $scope.loadProducts();
    };

    $scope.loadProducts = function() {
      ProductModel
        .getallSKUs({user: $scope.user.id})
        .then(function (response) {
          $scope.products = response;
        });
    };

    $scope.init();
  };

  angular.module('frontend.ppc.product')
  .controller('ProductListController', [
    '$scope', '$rootScope', 'UserService', 'ProductModel', 'DTOptionsBuilder', 'SettingsModel', '$timeout',
    ProductListController]);
 })();
