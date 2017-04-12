(function () {
  'use strict';

  angular.module('frontend.ppc.product')
    .filter("asDate", function () {
      return function (input) {
        return new Date(input);
      }
    })
    .factory('ProductModel', [
      'DataModel', 'DataService',
      function factory(
        DataModel, DataService
      ) {
        var model = new DataModel('product');

        model.customQuery = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/customQuery/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.customQuery() failed.', error, self.endpoint, type);
              }
            );
        };
        model.checkProductIsSetup = function(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/checkProductIsSetup/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.checkProductIsSetup() failed.', error, self.endpoint, type);
              }
            )
            ;
        };

        model.getZeroImpressionKeywords = function(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getZeroImpressionKeywords/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getZeroImpressionKeywords() failed.', error, self.endpoint, type);
              }
            );
        };

        model.searchSKUsByKeyword = function(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchSKUsByKeyword/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.searchSKUsByKeyword() failed.', error, self.endpoint, type);
              }
            );
        };

        model.searchbyACoSmult = function searchbyACoSmult(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchbyACoSmult/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.searchbyACoSmult() failed.', error, self.endpoint, type);
              }
            );
        };

        model.update_margins = function update_margins(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/update_margins/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.update_margins() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getbyID = function getbyID(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getbyID/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getbyID() failed.', error, self.endpoint, type);
              }
            )
            ;
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
                $log.error('ProductModel.getChart() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getChartbyKeyword = function getChartbyKeyword(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getChartbyKeyword/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getChartbyKeyword() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getallSKUs = function getallSKUs(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getallSKUs/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getallSKUs() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getalltests = function getalltests(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getalltests/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getalltests() failed.', error, self.endpoint, type);
              }
            );
        };

        model.gettestbyID = function gettestbyID(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettestbyID/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.gettestbyID() failed.', error, self.endpoint, type);
              }
            );
        };

        model.savenewtest = function savenewtest(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/savenewtest/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.savenewtest() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getbackend = function getbackend(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getbackend/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getbackend() failed.', error, self.endpoint, type);
              }
            );
        };

        model.update_backend = function update_backend(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/update_backend/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.update_backend() failed.', error, self.endpoint, type);
              }
            );
        };

        model.getabtestsstats = function getabtestsstats(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getabtestsstats/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('ProductModel.getabtestsstats() failed.', error, self.endpoint, type);
              }
            );
        };

        return model;
      }
    ]);
}());
