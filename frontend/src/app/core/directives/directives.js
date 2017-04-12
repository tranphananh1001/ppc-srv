// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.directives', [])
  	.directive('customToggle', function () {
      return {
      		restrict: 'A',
	    	link: function(scope, element, attr) {
	    		element.popover();
	    	}
    	};
    })
}());
