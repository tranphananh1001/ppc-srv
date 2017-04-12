// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.filters', [])
  	.filter('convertToCurrency', ['$rootScope', '$filter', function($rootScope, $filter) {
  		return function(input, decimalCount) {
  			if($rootScope.currency_sign == null  || typeof $rootScope.currency_sign == 'undefined') $rootScope.currency_sign = '$';
  			var val = parseFloat(input);
  			if(isNaN(val)) val = 0;

  			// val = val/$rootScope.currency_rate_USD*$rootScope.currency_rate;
  			val = $filter('number')(val, decimalCount);

  			return $rootScope.currency_sign + val;
  		};
  	}])
  	;
}());
