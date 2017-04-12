(function () {
  'use strict';

  angular.module('frontend.ppc.campaign')
    .factory('CampaignLogModel', [
      'DataModel', 'DataService', '$log',
      function factory(
        DataModel, DataService, $log
      ) {
        var model = new DataModel('campaignlog');
        model.track = function track(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/track/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.track() failed.', error, self.endpoint, type);
              }
            );
        };
        model.loadon = function(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/loadon/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.loadon() failed.', error, self.endpoint, type);
              }
            );
        };
        model.result = function result(data){
          var self = this;
          return DataService
            .collection(self.endpoint + '/result/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.result() failed.', error, self.endpoint, type);
              }
            );
        };
        model.delLog = function delLog(data){
          var self = this;
          return DataService
            .collection(self.endpoint + '/delete/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.delete() failed.', error, self.endpoint, type);
              }
            );
        };
        return model;
      }
    ]);
}());
