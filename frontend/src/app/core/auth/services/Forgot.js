(function(){
	'use strict';

	angular.module('frontend.core.auth.services')
		.factory('Forgot', [
			'$http', '$state', '$localStorage',
			'AccessLevels', 'BackendConfig', 'MessageService',
			function factory(
				$http, $state, $localStorage,
				AccessLevels, BackendConfig, MessageService
			){
				return{
					sendmail: function sendmail(email){
						console.log('huhuhuhu');
						return $http
							.post(BackendConfig.url+'/forgot',email,{withCredentirals: true})
							.then(
								function(response){
									MessageService.success('Your mail has been sent.');
								}
							);
					}
				};
			}
		]
	)
})