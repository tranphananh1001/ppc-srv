(function () {
  'use strict';

  angular.module('frontend.ppc.settings')
    .factory('SettingsModel', [
      'DataModel', 'DataService',
      function factory(DataModel,DataService) {

        var model = new DataModel('settings');

        model.getvalues = function getvalues(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/getvalues/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.saveAmazonCode = function saveAmazonCode(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/saveAmazonCode/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.reselect = function reselect(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/reselect/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.check_cancelled = function reselect(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/check_cancelled/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.load_tariffs = function load_tariffs(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/load_tariffs/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.check_token = function check_token(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/check_token/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.update_subscription = function update_subscription(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/update_subscription/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.load_tariffs_old = function load_tariffs_old(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/load_tariffs_old/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.delete_account = function delete_account(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/delete_account/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.addorreplace = function addorreplace(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/addorreplace/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.signup = function signup(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/signup/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.add_new_plan = function add_new_plan(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/add_new_plan/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.getallowedskus = function getallowedskus(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/getallowedskus/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.maxallowedSKUs = function maxallowedSKUs(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/maxallowedSKUs/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.get_initial_skus = function get_initial_skus(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/get_initial_skus/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.signup_continue = function signup_continue(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/signup_continue/', data)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        model.upload = function upload(data) {
          var fd = new FormData();
          fd.append('0', data);

          var self = this;

          return DataService
            .create(self.endpoint + '/upload/', fd)
            .then(function onSuccess(response) {
              return response.data;
            });
        };

        return model;
      }
    ])
    .factory('CampaignPerfomanceReportModel', [
      'DataModel',
      function factory(DataModel) {
        return new DataModel('campaignperfomancereport');
      }
    ]);
}());
