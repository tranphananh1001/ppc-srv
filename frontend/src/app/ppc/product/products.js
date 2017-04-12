/**
 * Products component to wrap all products specified stuff together. This component is divided to following logical components:
 *
 *  Controllers
 *  Models
 *
 * All of these are wrapped to 'frontend.ppc.products' angular module.
 */
(function() {
  'use strict';

  // Define frontend.ppc.product angular module
  angular.module('frontend.ppc.product', []);

  // Module configuration
  angular.module('frontend.ppc.product')
    .config([
      '$stateProvider',
      function config($stateProvider) {
        $stateProvider
          // Products list
          .state('ppc.products', {
            url: '/ppc/products',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/product/products-list.html',
                controller: 'ProductListController'
              }
            }
          })

          // Single product
          .state('ppc.product', {
            url: '/ppc/product/:id',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/product/product.html',
                controller: 'ProductController'
              }
            }
          })

          // Bulk margin update
          .state('ppc.products.update', {
            url: '/ppc/products/update',
            views: {
              'content@': {
                templateUrl: '/frontend/ppc/product/products-bulk-update.html',
                controller: 'ProductsBulkUpdateController'
              }
            }
          })
        ;
      }
    ])
  ;
}());
