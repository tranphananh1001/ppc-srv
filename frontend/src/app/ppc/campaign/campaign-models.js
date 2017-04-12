(function () {
  'use strict';

  angular.module('frontend.ppc.campaign')
    .factory('CampaignModel', [
      'DataModel', 'DataService', '$log',
      function factory(
        DataModel, DataService, $log
      ) {
        var model = new DataModel('campaign');

        model.update_acos = function update_acos(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/update_acos/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.update_acos() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.searchbykeyword = function searchbykeyword(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchbykeyword/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.searchbykeyword() failed.', error, self.endpoint);
              }
            );
        };

        model.searchCampaignsByKeyword = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchCampaignsByKeyword/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.searchCampaignsByKeyword() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.findKeywords = function(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/findKeywords/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.findKeywords() failed.', error, self.endpoint);
              }
            );
        };

        model.getRelatedUnprofitableTerms = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getRelatedUnprofitableTerms/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getRelatedUnprofitableTerms() failed.', error, self.endpoint);
              }
            );
        };

        model.searchbyduplicates = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchbyduplicates/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.searchbyduplicates() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.gettopCampaigns = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/gettopCampaigns/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.gettopCampaigns() failed.', error, self.endpoint);
              }
            );
        };

        model.getAllCampaignsAndBySku = function getAllCampaignsAndBySku(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getAllCampaignsAndBySku/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getAllCampaignsAndBySku() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getAllAdGroupByCampaignName = function getAllAdGroupByCampaignName(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getAllAdGroupByCampaignName/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getAllAdGroupByCampaignName() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getAllAdByAdGroup = function getAllAdByAdGroup(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getAllAdByAdGroup/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getAllAdByAdGroup() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getChartbyCampaign = function getChartbyCampaign(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getChartbyCampaign/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getChartbyCampaign() failed.', error, self.endpoint);
              }
            );
        };

        model.keywordsForCampaignAcos = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/keywordsForCampaignAcos/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.keywordsForCampaignAcos() failed.', error, self.endpoint);
              }
            );
        };

        model.keywordsForOptimizer = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/keywordsForOptimizer/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.keywordsForOptimizer() failed.', error, self.endpoint);
              }
            );
        };

        model.customQuery = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/customQuery/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.customQuery() failed.', error, self.endpoint);
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
                $log.error('CampaignModel.gettopKPI() failed.', error, self.endpoint);
              }
            );
        };

        model.getChartbyKeyword = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getChartbyKeyword/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getChartbyKeyword() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.searchbyACoS = function searchbyACoS(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/searchbyACoS/', data)
            .then(function onSuccess(response) {
              return response.data;
            }, function onError(error) {
              $log.error('CampaignModel.searchbyACoS() failed.', error, self.endpoint);
            });
        };

        model.searchbyACoSmult = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchbyACoSmult/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.searchbyACoSmult() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.searchbyACoSmult1 = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/searchbyACoSmult1/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.searchbyACoSmult1() failed.', error, self.endpoint);
              }
            );
        };

        model.getallskus = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getallskus/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getallskus() failed.', error, self.endpoint);
              }
            );
        };

        model.getSkusForCampaign = function getSkusForCampaign(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getSkusForCampaign/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getSkusForCampaign() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.saveNegateExactToSKU = function saveNegateExactToSKU(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/saveNegateExactToSKU/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.saveNegateExactToSKU() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.removekeywords = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/removekeywords/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                //$log.error('CampaignModel.removekeywords() failed.', error, self.endpoint);
              }
            );
        };

        model.getbelowacos = function getbelowacos(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getbelowacos/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getbelowacos() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getChartbySearch = function getChartbySearch(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getChartbySearch/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getChartbySearch() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getallcampaigns = function getallcampaigns(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getallcampaigns/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getallcampaigns() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getallgroups = function getallgroups(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getallgroups/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getallgroups() failed.', error, self.endpoint);
              }
            )
            ;
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
                $log.error('CampaignModel.getallSKUs() failed.', error, self.endpoint);
              }
            )
            ;
        };
        model.savemodel = function savemodel(data) {
          var self = this;
          return DataService
            .collection(self.endpoint + '/savemodel/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.savemodel() failed.', error, self.endpoint);
              }
            );
        };
        model.savelog = function savelog(data){
          var self = this;
          return DataService
            .collection(self.endpoint + '/savelog/', data)
            .then(
              function onSuccess(response){
                return response.data;
              },
              function onError(error){
                $log.error('CampaignModel.savelog() failed.', error, self.endpoint);
              }
            );
        };
        model.loadlog = function (data){
          var self = this;
          return DataService
            .collection(self.endpoint + '/loadlog/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error){
                $log.error('CampaignModel.loadlog() faliled.', error, self.endpoint);
              }
            );
        }
        model.loadmodels = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/loadmodels/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.loadmodels() failed.', error, self.endpoint);
              }
            )
            ;
        };
        model.loadmodel = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/loadmodel/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.loadmodel() failed.', error, self.endpoint);
              }
            )
            ;
        };

        model.getalltests = function (data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/getalltests/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.getalltests() failed.', error, self.endpoint);
              }
            );
        }

        model.savenewtest = function savenewtest(data) {
          var self = this;

          return DataService
            .collection(self.endpoint + '/savenewtest/', data)
            .then(
              function onSuccess(response) {
                return response.data;
              },
              function onError(error) {
                $log.error('CampaignModel.savenewtest() failed.', error, self.endpoint);
              }
            )
            ;
        };

        return model;
      }
    ])
  ;
}());
