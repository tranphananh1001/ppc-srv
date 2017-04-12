// Generic models angular module initialize.
(function() {
  'use strict';

  angular.module('frontend.core.libraries', []);


	// date Library
	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf());
		dat.setDate(dat.getDate() + days);
		return dat;
	};

	Date.getDatesArrayBetween = function (startDate, stopDate, interval) {
		var dateArray = new Array();
		var currentDate = startDate;
		while (currentDate <= stopDate) {
			dateArray.push( new Date (currentDate) );
			currentDate = currentDate.addDays(interval);
		}
		return dateArray;
	};
	
	Number.ordinal_suffix_of = function(i) {
		var j = i % 10,
			k = i % 100;
		if (j == 1 && k != 11) {
			return i + "st";
		}
		if (j == 2 && k != 12) {
			return i + "nd";
		}
		if (j == 3 && k != 13) {
			return i + "rd";
		}
		return i + "th";
	};
	
	Number.intVal = function ( i ) {
		var k = i;
		if(typeof k === 'string') {
			var currencies = ['$', '¥', '£', '€', '₹', ','];
			_.each(currencies, function(cur) {
				k = k.replace(cur, '');
			});
		}
		var val = parseFloat(k);
		if(isNaN(val)) val = 0;
		return val;
	};

	String.validateEmailAddress = function (email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}
}());
