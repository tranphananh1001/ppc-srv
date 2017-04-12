(function () {
  'use strict';

  angular.module('frontend.ppc.power')
    .factory('PowerModel', [
      'DataModel', 'DataService',
      function factory(DataModel, DataService) {
        var model = new DataModel('power');
        model.gettopCampaigns = function gettopCampaigns(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettopCampaigns/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.gettopCampaigns() failed.', error, self.endpoint, type);
              }
            );
        };
        return model;
      }
    ]);
}());
