(function () {
  'use strict';
  // Controller which contains all necessary logic for product list GUI on boilerplate application.
  var ProductsBulkUpdateController = function ($scope, $rootScope, UserService, ProductModel, DTOptionsBuilder, SettingsModel, $timeout, MessageService) {
    $rootScope.initPage($scope);

    $scope.init = function() {
      $scope.dtOptions = DTOptionsBuilder
              .newOptions()
              .withScroller().withOption('scrollY', 400)
              .withOption('aaSorting', [[1, 'desc']])
              .withOption('iDisplayLength', 25);

      $scope.loadProducts();
    };

    $scope.loadProducts = function() {
      ProductModel
        .getallSKUs({user: $scope.user.id})
        .then(function (response) {
          $scope.products = response;
        });
    };

    $scope.onSave = function(product) {
      if(isNaN(product.cost_per_unit) || (typeof product.cost_per_unit === 'undefined') || product.cost_per_unit == null ||
        isNaN(product.total_shipping_costs) ||  (typeof product.total_shipping_costs === 'undefined') || product.total_shipping_costs == null ||
        isNaN(product.additional_per_unit_costs) ||  (typeof product.additional_per_unit_costs === 'undefined') || product.additional_per_unit_costs == null ||
        isNaN(product.amazon_FBA_fees) ||  (typeof product.amazon_FBA_fees === 'undefined') ||  product.amazon_FBA_fees == null ||
        isNaN(product.average_selling_price) ||  (typeof product.average_selling_price === 'undefined') ||  product.average_selling_price == null) return;

      var data = angular.copy(product);
      data.user = $scope.user.id;
      // Make actual data update
      ProductModel
        .update_margins(data)
        .then(function() {
          //
        });
    };

    $scope.onSaveAll = function() {
      MessageService.success('Products updated successfully');
    };

    $scope.init();
  };

  angular.module('frontend.ppc.product')
  .controller('ProductsBulkUpdateController', [
    '$scope', '$rootScope', 'UserService', 'ProductModel', 'DTOptionsBuilder', 'SettingsModel', '$timeout', 'MessageService',
    ProductsBulkUpdateController]);
 })();
