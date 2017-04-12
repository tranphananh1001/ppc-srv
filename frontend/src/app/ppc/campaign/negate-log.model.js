/**
 * This file contains all necessary Angular model definitions for 'frontend.examples.book' module.
 *
 * Note that this file should only contain models and nothing else. Also note that these "models" are just basically
 * services that wraps all things together.
 */
(function () {
  'use strict';


  angular.module('frontend.ppc.campaign')
    .factory('NegateLogModel', [
      'DataModel', 'DataService', '$log',
      function factory(
        DataModel, DataService, $log
      ) {
        var model = new DataModel('negatelog');

        model.bulkCreate = function bulkCreate(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/bulkCreate/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('NegateLogModel.track() failed.', error, self.endpoint);
              }
            );
        };

        model.find = function bulkCreate(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/find/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('NegateLogModel.track() failed.', error, self.endpoint);
              }
            );
        };



        return model;
      }
    ])
  ;
}());
