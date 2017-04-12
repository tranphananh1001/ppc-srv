/**
 * This file contains all necessary Angular model definitions for 'frontend.examples.book' module.
 *
 * Note that this file should only contain models and nothing else. Also note that these "models" are just basically
 * services that wraps all things together.
 */
(function () {
  'use strict';

  angular.module('frontend.ppc.home')
    .factory('HomeModel', [
      'DataModel', 'DataService','$log',
      function factory(
        DataModel, DataService
      ) {
        var model = new DataModel('home');

        model.gettopSKU = function gettopSKU(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettopSKU/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.gettopSKU() failed.', error, self.endpoint, type);
              }
            );
        };
        model.checkAccountIsSetup = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/checkAccountIsSetup/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.checkAccountIsSetup() failed.', error, self.endpoint, type);
              }
            );
        };
        model.gettopKPI = function gettopKPI(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettopKPI/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.gettopKPI() failed.', error, self.endpoint, type);
              }
            );
        };
        model.getChart = function getChart(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getChart/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.getChart() failed.', error, self.endpoint, type);
              }
            );
        };
        model.gettopCampaigns = function gettopCampaigns(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettopCampaigns/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.gettopCampaigns() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getpiechart = function getpiechart(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getpiechart/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('HomeModel.getpiechart() failed.', error, self.endpoint, type);
              }
            );
        };

        return model;
      }
    ]);
}());
