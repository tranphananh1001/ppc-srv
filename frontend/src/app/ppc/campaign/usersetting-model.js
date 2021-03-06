/**
 * This file contains all necessary Angular model definitions for 'frontend.examples.book' module.
 *
 * Note that this file should only contain models and nothing else. Also note that these "models" are just basically
 * services that wraps all things together.
 */
(function () {
  'use strict';


  angular.module('frontend.ppc.campaign')
    .factory('UserSettingModel', [
      'DataModel', 'DataService',
      function factory(
        DataModel, DataService
      ) {
        var model = new DataModel('usersetting');

    model.loadUser = function loadUser(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/loaduser/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('UserSettingModel.loaduser() failed.', error, self.endpoint, type);
              }
            )
            ;
        };

    model.create = function loadUser(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/create/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('UserSettingModel.loaduser() failed.', error, self.endpoint, type);
              }
            )
            ;
        };

    model.update = function loadUser(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/update/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('UserSettingModel.loaduser() failed.', error, self.endpoint, type);
              }
            )
            ;
        };

        return model;
      }
    ])
  ;
}());
