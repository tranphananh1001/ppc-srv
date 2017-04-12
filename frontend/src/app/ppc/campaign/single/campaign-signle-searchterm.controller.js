(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .service('SkuModalService', ['$rootScope',
      function($rootScope) {
        this.data = {
          userId : '',
          keywordType : 0,
        };

        this.products = [];
        this.message = '';
        this.items = [];

        this.setMessage = function (msg) {
          this.data.message = msg;
        }

        this.setItems = function(items) {
          this.items = items;
        }

        this.setMetaData = function (userId, type, skus) {
          this.data.userId = userId;
          this.data.keywordType = type;
          this.products = skus;
        }
      }
    ]).controller('SkuNegateModalController', ['$rootScope', '$scope', '$modalInstance', 'SkuModalService', 'DTOptionsBuilder', 'NegateLogModel',
      function($rootScope, $scope, $modalInstance, SkuModalService, DTOptionsBuilder, NegateLogModel) {
        $scope.data = SkuModalService.data;
        $scope.products = SkuModalService.products;

        $scope.checkFeature = {
          all : false,
          selected : []
        }

        $scope.onCheckFeatureAll = function() {
          $scope.checkFeature.selected = angular.copy($scope.products);
        };

        $scope.onCheckFeatureOne = function() {
          $scope.checkFeature.all = $scope.checkFeature.selected.length == $scope.products.length;
        };

        $scope.ok = function() {
          $modalInstance.close($scope.checkFeature.selected);
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    ])
    .controller('SingleCampaignSearchTermController', [
      '$scope', '$rootScope', '$state', '$stateParams', 'MessageService', 'HomeModel', '$filter',
      'ListConfig', 'SocketHelperService', 'SettingsModel','SkuModalService', '$modal',
      'UserService', 'CampaignModel', 'CampaignLogModel', 'NegateLogModel', 'DTOptionsBuilder', '$timeout',
      function controller($scope, $rootScope, $state, $stateParams, MessageService, HomeModel, $filter,
        ListConfig, SocketHelperService, SettingsModel, SkuModalService, $modal,
        UserService, CampaignModel, CampaignLogModel,NegateLogModel, DTOptionsBuilder, $timeout) {

        $scope.user = UserService.user();

        $stateParams.campaign = $rootScope.decodeURL($stateParams.campaign);
        $scope.campaignId = $stateParams.id;
        $scope.campaignName = $stateParams.campaign;

        $scope.datePicker = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days'),
          },
        };
        $scope.dateRangeOptions = {
          showDropdowns: true,
          linkedCalendars: false,
          ranges: {
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            "Last 60 Days": [moment().subtract(59, 'days'), moment()],
            "Last 90 Days": [moment().subtract(89, 'days'), moment()],
            "Last 120 Days": [moment().subtract(119, 'days'), moment()]
          },
          alwaysShowCalendars: true,
          eventHandlers: {
            'apply.daterangepicker': function() {
              $scope.$parent.updateDate($scope.datePicker.date);
              $scope.dateUpdated();
            }
          }
        };

        $timeout(function() {
          $('.search-term-tab-container a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var targetId = $(e.target).data('target');
            $rootScope.$broadcast('tab-changed', {
              page: 'search-term',
              tabId: targetId,
            });

            if (targetId === '#tab-profitable-terms') {
              $('#table-profitable-terms').DataTable().columns.adjust();
            } else if (targetId === '#tab-non-profitable-terms') {
              $('#table-non-profitable-terms').DataTable().columns.adjust();
            } else if (targetId === '#tab-negative-word-finder') {
              $('#table-negative-words').DataTable().columns.adjust();
            }
          });
        }, 500);

        $scope.model7 = {};
        $scope.model8 = {};
        $scope.model9 = {};

        $scope.loadKeywords = function(i, location) {
          var saveacosToLoad = $scope.saveacos;
          if (!saveacosToLoad) {
            saveacosToLoad  = $scope.$parent.currentSetting.average_acos;
          }

          switch (i) {
            case 7:
              // Profitable Keywords.
              var acosFromFilter = 0;
              var acosToFilter = saveacosToLoad;

              if (typeof $scope.model7.acosfrom !== 'undefined' && $scope.model7.acosfrom !== null && $scope.model7.acosfrom !== '') {
                  acosFromFilter = Math.max(acosFromFilter, parseInt($scope.model7.acosfrom));
              }
              if (typeof $scope.model7.acosto !== 'undefined' && $scope.model7.acosto !== null && $scope.model7.acosto !== '') {
                acosToFilter = Math.min(acosToFilter, parseInt($scope.model7.acosto))
              }

              var filterOptions = {
                campaign: $stateParams.campaign,
                user: $scope.user.id,
                adgroup: $scope.currentAdGroup3,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                searchterm_only: $scope.filterFeature.searchterms.profitable.searchterms_only,
                order: 'ASC',
                acosfrom: acosFromFilter,
                acosto: acosToFilter,
              };

              var fields = [
                'revenuefrom', 'revenueto',
                'adspendfrom', 'adspendto',
                'impressionsfrom', 'impressionsto',
                'clicksfrom', 'clicksto',
                'ctrfrom', 'ctrto',
                'avecpcfrom', 'avecpcto',
                'ordersFrom', 'ordersTo',
                'conversionRateFrom', 'conversionRateTo',
                'match1',
              ];

              fields.forEach(function (field) {
                if (typeof $scope.model7[field] !== 'undefined' && $scope.model7[field] !== null && $scope.model7[field] !== '') {
                  filterOptions[field] = $scope.model7[field];
                }
              });

              CampaignModel.searchbyACoS(filterOptions)
                .then(function(response) {
                  $scope.adClick = true;
                  $scope.profitableKeywords = response;
                });
              break;
            case 8:
              // Non-profitable Keywords.
              var acosFromFilter = 0;
              var acosToFilter = saveacosToLoad;

              if (typeof $scope.model8.acosfrom !== 'undefined' && $scope.model8.acosfrom !== null && $scope.model8.acosfrom !== '') {
                  acosFromFilter = Math.max(acosFromFilter, parseInt($scope.model8.acosfrom));
              }
              if (typeof $scope.model8.acosto !== 'undefined' && $scope.model8.acosto !== null && $scope.model8.acosto !== '') {
                  acosToFilter = Math.min(acosToFilter, parseInt($scope.model8.acosto))
              }

              var filterOptions = {
                campaign: $stateParams.campaign,
                user: $scope.user.id,
                adgroup: $scope.currentAdGroup4,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                searchterm_only: $scope.filterFeature.searchterms.nonprofitable.searchterms_only,
                order: 'DESC',
                acosfrom: acosFromFilter,
                acosto: acosToFilter,
              };

              var fields = [
                'revenuefrom', 'revenueto',
                'adspendfrom', 'adspendto',
                'impressionsfrom', 'impressionsto',
                'clicksfrom', 'clicksto',
                'ctrfrom', 'ctrto',
                'avecpcfrom', 'avecpcto',
                'ordersFrom', 'ordersTo',
                'conversionRateFrom', 'conversionRateTo',
                'match1',
              ];

              fields.forEach(function (field) {
                if (typeof $scope.model8[field] !== 'undefined' && $scope.model8[field] !== null && $scope.model8[field] !== '') {
                  filterOptions[field] = $scope.model8[field];
                }
              });

              CampaignModel.searchbyACoS(filterOptions)
                .then(function(response) {
                  $scope.adClick = true;
                  $scope.nonProfitableKeywords = response;
                  $scope.nonProfitableKeywordsFilteredByClick = _.filter($scope.nonProfitableKeywords, function (keyword) {
                    return (parseInt(keyword.Clicks) >= 5) && (parseInt(keyword.Orders) === 0);
                  });
                  $scope.nonProfitableKeywordsFilteredByImpression = _.filter($scope.nonProfitableKeywords, function (keyword) {
                    //return (parseInt(keyword.Impressions) >= 1000) && (parseInt(keyword.Clicks) === 0);
                    return (parseFloat(keyword.CTR) * 100 < 0.4);
                  });
                });
              break;
            case 9:
              // Negative Word Finder.
              var filterOptions = {
                user: $scope.user.id,
                campaign: $stateParams.campaign,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                acosfrom: 0,
                acosto: $scope.saveacos,
                order: 'DESC',
              };

              var fields = [
                'revenuefrom', 'revenueto',
                'adspendfrom', 'adspendto',
                'impressionsfrom', 'impressionsto',
                'clicksfrom', 'clicksto',
                'ctrfrom', 'ctrto',
                'avecpcfrom', 'avecpcto',
                'ordersFrom', 'ordersTo',
                'conversionRateFrom', 'conversionRateTo',
                'match1',
              ];

              fields.forEach(function (field) {
                if (typeof $scope.model9[field] !== 'undefined' && $scope.model9[field] !== null && $scope.model9[field] !== '') {
                  filterOptions[field] = $scope.model9[field];
                }
              });

              CampaignModel.searchbyACoS(filterOptions)
                .then(function (negativeList) {
                  filterOptions.order = 'ASC';
                  CampaignModel.searchbyACoS(filterOptions).then(function (positiveList) {
                    var destAry = [];
                    var destCnt = [];
                    var dest2Ary = new Array();
                    var destObj = [];
                    var destAD = [];
                    var destRev = [];

                    $scope.positive_list = positiveList;
                    $scope.negative_list = negativeList;

                    for (var i in $scope.negative_list) {
                      var tmpStr = $scope.negative_list[i].Search;
                      if (tmpStr === undefined) continue;
                      var tmpAry = tmpStr.split(" ");
                      for (var j = 0; j < tmpAry.length; j++) {
                        if (destAry.indexOf(tmpAry[j]) == -1) {
                          destAry.push(tmpAry[j]);
                          destCnt.push($scope.negative_list[i].Clicks);
                          destAD.push($scope.negative_list[i].Cost);
                          destRev.push($scope.negative_list[i].Revenue);
                        } else {
                          destCnt[destAry.indexOf(tmpAry[j])] += $scope.negative_list[i].Clicks;
                          destAD[destAry.indexOf(tmpAry[j])] += $scope.negative_list[i].Cost;
                          destRev[destAry.indexOf(tmpAry[j])] += $scope.negative_list[i].Revenue;
                        }
                      };
                    }

                    for (var i in $scope.positive_list) {
                      var tmpStr = $scope.positive_list[i].Search;
                      if (tmpStr === undefined) continue;
                      var tmpAry = tmpStr.split(" ");
                      for (var j = 0; j < tmpAry.length; j++) {
                        if (destAry.indexOf(tmpAry[j]) != -1) {
                          destAry[destAry.indexOf(tmpAry[j])] = null;
                        }
                      }
                    }

                    for (var i = 0; i < destAry.length; i++) {
                      if (destAry[i] == null) continue;
                      dest2Ary.push(Array(destCnt[i], destAry[i], destAD[i], destRev[i]));
                    }

                    function compareNumbers(a, b) {
                      if (a[0] === b[0])
                        return 0;
                      else
                        return (a[0] < b[0]) ? -1 : 1;
                    }
                    dest2Ary.sort(compareNumbers);
                    for (var i = 0; i < dest2Ary.length; i++) {
                      // FIXME: Where do we use the following code?
                      /* if (typeof $scope.model9.uclicksfrom === "undefined" || $scope.model9.uclicksfrom === null || $scope.model9.uclicksfrom === '') {
                        testmodel9.uclicksfrom = -99999999;
                      } else {
                        testmodel9.uclicksfrom = $scope.model9.uclicksfrom;
                      }

                      if (typeof $scope.model9.uclicksto === "undefined" || $scope.model9.uclicksto === null || $scope.model9.uclicksto === '') {
                        testmodel9.uclicksto = 99999999;
                      } else {
                        testmodel9.uclicksto = $scope.model9.uclicksto;
                      } */

                      if (dest2Ary[i][0] < parseInt($scope.model9.uclicksfrom) || dest2Ary[i][0] > parseInt($scope.model9.uclicksto)) {
                        continue;
                      }

                      destObj.push({
                        Search: dest2Ary[i][1],
                        Clicks: parseInt(dest2Ary[i][0]),
                        ADSpend: dest2Ary[i][2],
                        AYS: dest2Ary[i][2] * 12,
                        Revenue: dest2Ary[i][3],
                        selected: false,
                      });
                    }

                    destObj.sort(function(keyword1, keyword2) {
                      return keyword2.Clicks - keyword1.Clicks;
                    });

                    $scope.negativeKeywords = destObj;
                  });
                });
              break;
          }
        }

        $scope.modelload = function(j, i) {
          var loadmodel = CampaignModel.loadmodel({
              user: $scope.user.id,
              id: i
            })
            .then(function(response) {
              eval('$scope.model' + j + ' =  response[0];');
            });
        };

        $scope.modelOptionsload = function() {
          CampaignModel.loadmodels({
              user: $scope.user.id,
              modelno: 7
            })
            .then(function(response) {
              $scope.modeloptions7 = response;
              $scope.modeloptions8 = response;
              $scope.modeloptions9 = response;
            });
        };

        $scope.modelclear = function(i) {
          eval('delete $scope.model' + i + ';');
          eval('$scope.model' + i + ' = {};');
        };

        $scope.modelsave = function(i, model) {
          CampaignModel.savemodel({
              user: $scope.user.id,
              name: model.name,
              profitfrom: model.profitfrom,
              profitto: model.profitto,
              revenuefrom: model.revenuefrom,
              revenueto: model.revenueto,
              adspendfrom: model.adspendfrom,
              adspendto: model.adspendto,
              acosfrom: model.acosfrom,
              acosto: model.acosto,
              impressionsfrom: model.impressionsfrom,
              impressionsto: model.impressionsto,
              clicksfrom: model.clicksfrom,
              clicksto: model.clicksto,
              ctrfrom: model.ctrfrom,
              ctrto: model.ctrto,
              avecpcfrom: model.avecpcfrom,
              avecpcto: model.avecpcto,
              ordersFrom: model.ordersFrom,
              ordersTo: model.ordersTo,
              conversionRateFrom: model.conversionRateFrom,
              conversionRateTo: model.conversionRateTo,
              modelno: i
            })
            .then(function(response) {
              MessageService.success('Model saved');
              $scope.modelOptionsload();
            });
        };

        $scope.initialLoadData = function() {
          CampaignModel.getallgroups({
            user: $scope.user.id,
            acosfrom: $scope.saveacos,
            acostill: 0,
            campaign: $stateParams.campaign,
            startDate: $scope.datePicker.date.startDate,
            endDate: $scope.datePicker.date.endDate,
          })
          .then(function(response) {
            $scope.unique = response;
          });

          $scope.loadKeywords(7);
          $scope.loadKeywords(8);
          $scope.loadKeywords(9);
        }

        $scope.dateUpdated = function () {
          $scope.initialLoadData();
        }

        $scope.dateUpdatedFlag = false;
        $scope.$on('CAMPAIGN_DATE_UPDATED', function () {
          var date = $scope.$parent.datePicker.date;
          var updateFlag = false;
          if (!$scope.datePicker.date.startDate.isSame(date.startDate)) {
            updateFlag = true;
          }

          if (!$scope.datePicker.date.endDate.isSame(date.endDate)) {
            updateFlag = true;
          }

          if (updateFlag) {
            $scope.dateUpdatedFlag = true;
          }
        });

        $scope.isFirstTime = true;
        $scope.$on('CAMPAIGN_SEARCHTERM_TAB_LOADED', function() {
          if($scope.isFirstTime) {
            $scope.KPI = $scope.$parent.KPI;
            $scope.saveacos = $scope.KPI.acos1;

            $scope.datePicker.date = $scope.$parent.datePicker.date;

            $scope.initialLoadData();
            $scope.modelOptionsload();

            $scope.isFirstTime = false;

          } else if ($scope.dateUpdatedFlag) {
            $scope.datePicker.date = $scope.$parent.datePicker.date;
            $scope.dateUpdated();
            $scope.dateUpdatedFlag = false;
          }
        });

        $scope.$on('CAMPAIGN_KPI_UPDATED', function() {
          $scope.KPI = $scope.$parent.KPI;
          $scope.saveacos = $scope.KPI.acos1;
        });

        // BEGIN COPY ALL, ADD SEARCH //

        $scope.copiedProfitableKeywords = '';
        $scope.copiedkeywordsmatrix7 = [];
        $scope.copiedkeywords8 = '';
        $scope.copiedkeywordsmatrix8 = [];
        $scope.copiedkeywords9 = '';

        $scope.copyall7 = function() {
          $scope.copiedProfitableKeywords = '';
          $scope.copiedkeywords7 = '';
          $scope.copiedkeywordsmatrix7 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.searchterm_profitable.length - 1; i++) {
            $scope.copiedkeywordsmatrix7.push($scope.checkFeature.selected.searchterm_profitable[i].Search);
          }

          $scope.copiedProfitableKeywords = $scope.copiedkeywordsmatrix7.toString().replace(/,/g, '\n');

          // Prevent add duplicate search term (case-sensitive and incase-sensitive) in Search Term Optimization feature
          const uniqueArr = removeDuplicateSearchTerm($scope.copiedkeywordsmatrix7);
          $scope.copiedkeywords7 = uniqueArr.toString().replace(/,/g, '\n');
        };

        function removeDuplicateSearchTerm(arr) {
          var upperCaseArr = [];
          arr.map(function(item) {
            if (item === item.toUpperCase()) {
              upperCaseArr.push(item);
            }
          });

          if (upperCaseArr.length === 0) {
            return arr;
          }

          var lowerCaseArr = arr.filter(function(item) {
            return item !== item.toUpperCase();
          });

          //Get unique remain elements
          var remainElesArr = [];
          upperCaseArr.map(function(item){
            if (arr.indexOf(item.toLowerCase()) === -1) {
              remainElesArr.push(item);
            }
          })

          return lowerCaseArr.concat(remainElesArr);
        }

        $scope.copyall8 = function() {

          $scope.copiedkeywords8 = '';
          $scope.copiedkeywordsmatrix8 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.searchterm_nonprofitable.length - 1; i++) {
            $scope.copiedkeywordsmatrix8.push($scope.checkFeature.selected.searchterm_nonprofitable[i].Search);
          }

          $scope.copiedkeywords8 = $scope.copiedkeywordsmatrix8.toString().replace(/,/g, '\n');
        };

        $scope.copyall9 = function() {
          var selectedKeywords = [];
          $scope.negativeKeywords.forEach(function(keyword) {
            if (keyword.selected) {
              selectedKeywords.push(keyword.Search);
            }
          });
          $scope.copiedkeywords9 = selectedKeywords.toString().replace(/,/g, '\n');
        };

        $scope.copyword9 = function(keyword) {
          if ($scope.copiedkeywords9.length > 0)
            $scope.copiedkeywords9 += "\n" + keyword;
          else {
            $scope.copiedkeywords9 += keyword;
          }
        }

        $scope.negateAllExact8 = function () {
          $scope.copiedNegatekeywords8 = '';
          $scope.copiedNegatekeywordsmatrix8 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.searchterm_nonprofitable.length - 1; i++) {
            $scope.copiedNegatekeywordsmatrix8.push($scope.checkFeature.selected.searchterm_nonprofitable[i].Search);
          }

          if ($scope.copiedNegatekeywordsmatrix8.length > 0) {
            $scope.copiedNegatekeywords8 = $scope.copiedNegatekeywordsmatrix8.toString().replace(/,/g, '\n');

            SkuModalService.setMetaData($scope.user.id, 0, $scope.$parent.campaignSKUs);

            var modalInstance = $modal.open({
              templateUrl: '/frontend/ppc/campaign/partials/sku-modal.html',
              controller: 'SkuNegateModalController',
              windowClass: 'app-modal-window'
            });

            modalInstance.result.then(function (selectedItem) {
              if (selectedItem.length > 0) {
                var selectedSkus = selectedItem.map(function(item) {
                  return item.SKU;
                });

                NegateLogModel.bulkCreate({
                  user : $scope.user.id,
                  keywordType : 0, //Keyword Type value for Exact  = 0, 1 means phrase
                  keywords : $scope.copiedNegatekeywordsmatrix8,
                  skus : selectedSkus
                })
                .then(function (result) {
                  MessageService.success('Added to Negative Exact List');
                });
              }
            });
          }
        }

        function addToNegativeListOnNegativeWordFinder() {
          $scope.copiedNegatekeywords9 = '';

          var selectedKeywords = [];
          $scope.negativeKeywords.forEach(function(keyword) {
            if (keyword.selected) {
              selectedKeywords.push(keyword.Search);
            }
          })

          if (!selectedKeywords.length) {
            return;
          }

          $scope.copiedNegatekeywords9 = selectedKeywords.toString().replace(/,/g, '\n');

          SkuModalService.setMetaData($scope.user.id, 1, $scope.$parent.campaignSKUs);

          var modalInstance = $modal.open({
            templateUrl: '/frontend/ppc/campaign/partials/sku-modal.html',
            controller: 'SkuNegateModalController',
            windowClass: 'app-modal-window'
          });

          modalInstance.result.then(function(selectedItem) {
            if (!selectedItem.length) {
              return;
            }

            var selectedSkus = selectedItem.map(function(item) {
              return item.SKU;
            });

            NegateLogModel.bulkCreate({
              user : $scope.user.id,
              keywordType : 1, //Keyword Type value for Exact  = 0, 1 means phrase
              keywords : selectedKeywords,
              skus : selectedSkus
            })
            .then(function (result) {
              MessageService.success('Added to Negative Phrase List');
            });
          }, function() {
            //  $log.info('Modal dismissed at: ' + new Date());
          });
        }

        $scope.addsearch7 = function(keyword) {
          // search and remove the string.
          var found = false;
          for (var i = $scope.copiedkeywordsmatrix7.length - 1; i >= 0; i--) {
            if ($scope.copiedkeywordsmatrix7[i] === keyword) {
              $scope.copiedkeywordsmatrix7.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            //if didnt found push it to the bottom
            $scope.copiedkeywordsmatrix7.push(keyword)
          }

          //rebuild
          $scope.copiedProfitableKeywords = $scope.copiedkeywordsmatrix7.toString().replace(/,/g, '\n');
        };

        $scope.addsearch8 = function(keyword) {
          // search and remove the string.
          var found = false;
          for (var i = $scope.copiedkeywordsmatrix8.length - 1; i >= 0; i--) {
            if ($scope.copiedkeywordsmatrix8[i] === keyword) {
              $scope.copiedkeywordsmatrix8.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            //if didnt found push it to the bottom
            $scope.copiedkeywordsmatrix8.push(keyword)
          }
          //rebuild
          $scope.copiedkeywords8 = $scope.copiedkeywordsmatrix8.toString().replace(/,/g, '\n');
        };

        // ------ BEGIN DATATABLE --------------

        $scope.$on('CURRENCY_UPDATED', function() {
          reloadDataTables();
        });

        $scope.dtInstances = {};

        function reloadDataTables() {
          _.map($scope.dtInstances, function (_instance) {
            _instance.rerender();
          });
        }

        $scope.dtInstanceCallbackSearchPro = function (_instance) {
          $scope.dtInstances.SearchPro = _instance;
        };

        $scope.dtInstanceCallbackSearchUnPro = function (_instance) {
          $scope.dtInstances.SearchUnPro = _instance;
        };

        $scope.dtInstanceCallbackSearchUnProFilterByClick = function (_instance) {
          $scope.dtInstances.SearchUnProFilterByClick = _instance;
        };

        $scope.dtInstanceCallbackSearchUnProFilterByImpression = function (_instance) {
          $scope.dtInstances.SearchUnProFilterByImpression = _instance;
        };

        $scope.dtInstanceCallbackSearchNeg = function (_instance) {
          $scope.dtInstances.SearchNeg = _instance;
        };

        $scope.adClick = false;

        $scope.dtOptionsSearchPro = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['search_pro'])
          .withOption('aaSorting', [
            [1, 'desc']
          ])
          .withButtons([{
              text: 'Copy To Clipboard Below',
              action: function () {
                $scope.$apply(function () {
                  $scope.copyall7();
                });
              }
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              extend: 'excel',
              text: 'Excel',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            }
          ])
          .withOption('preDrawCallback', function (settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['search_pro']);
            }
            $rootScope._dtSetting.save('search_pro', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('drawCallback', function() {
            var api = this.api(), pagesum = [];
            for (var i = 5; i <= 12; i++) {
              pagesum[i] = api
                .column(i, {
                  page: 'current'
                })
                .data()
                .reduce(function (a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);

              if (i <= 6) {
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
              } else if (i == 7) {
                $(api.column(i).footer()).html((pagesum[6] / pagesum[5] * 100).toFixed(2).toLocaleString());
              } else if (i == 10) {
                $(api.column(i).footer()).html((pagesum[9] / pagesum[8] * 100).toFixed(2).toLocaleString());
              } else if (i == 11) {
                $(api.column(i).footer()).html((pagesum[6] / pagesum[9]).toFixed(2).toLocaleString());
              } else {
                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
              }
            }
          });

        $scope.dtOptionsNonProfitableKeywords = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['search_unpro'])
          .withOption('aaSorting', [
            [1, 'asc']
          ])
          .withButtons([
            {
              text: 'Copy To Clipboard Below',
              action: function() {
                $scope.$apply(function() {
                  $scope.copyall8();
                });
              }
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              extend: 'excel',
              text: 'Excel',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              text: 'Add to Negative List',
              action: function() {
                $scope.$apply(function() {
                  $scope.negateAllExact8();
                });
              }
            }
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['search_unpro']);
            }
            $rootScope._dtSetting.save('search_unpro', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('drawCallback', function() {
            var api = this.api();
            var pagesum = [];
            for (var i = 5; i <= 11; i++) {
              pagesum[i] = api.column(i, {
                  page: 'current'
                }).data()
                .reduce(function(a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);

              if (i <= 6) {
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
              } else if (i == 7) {
                $(api.column(i).footer()).html((pagesum[6] / pagesum[5] * 100).toFixed(2).toLocaleString());
              } else if (i == 10) {
                $(api.column(i).footer()).html((pagesum[9] / pagesum[8] * 100).toFixed(2).toLocaleString());
              } else if (i == 11) {
                $(api.column(i).footer()).html((pagesum[6] / pagesum[9]).toFixed(2).toLocaleString());
              } else {
                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
              }
            }
          });

        $scope.dtOptionsNonProfitableKeywordsFilterByClick = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['search_unpro_filter_by_click'])
          .withOption('aaSorting', [
            [1, 'desc']
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['search_unpro_filter_by_click']);
            }
            $rootScope._dtSetting.save('search_unpro_filter_by_click', settings._iDisplayLength);
            $scope.adClick = false;
          });

        $scope.dtOptionsNonProfitableKeywordsFilterByImpression = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['search_unpro_filter_by_impression'])
          .withOption('aaSorting', [
            [1, 'desc']
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['search_unpro_filter_by_impression']);
            }
            $rootScope._dtSetting.save('search_unpro_filter_by_impression', settings._iDisplayLength);
            $scope.adClick = false;
          });

        $scope.dtOptionsNegativeWordFinder = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('aaSorting', [
            [2, 'desc']
          ])
          .withButtons([{
              text: 'Copy To Clipboard Below',
              action: function() {
                $scope.copyall9();
                $scope.$apply();
              }
            },
            {
              extend: 'csv',
              text: 'CSV',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              extend: 'excel',
              text: 'Excel',
              exportOptions: {
                modifier: {
                  page: 'current'
                }
              }
            },
            {
              text: 'Add to Negative List',
              action: function() {
                $scope.$apply(function() {
                  addToNegativeListOnNegativeWordFinder();
                });
              }
            }
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['search_neg'])
          .withOption('drawCallback', function(row) {
            var api = this.api();
            $rootScope._dtSetting.save('search_neg', api.context[0]._iDisplayLength);
            var pagesum = [];
            for (var i = 2; i <= 5; i++) {
              pagesum[i] = api.column(i, {
                  page: 'current'
                }).data()
                .reduce(function(a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);
              if (i != 2)
                $(api.column(i).footer()).html(pagesum[i].toFixed(2));
              else
                $(api.column(i).footer()).html(pagesum[i]);
            }
          });


        // ------ END DATATABLE --------------


        $scope.currentAdGroup3 = null;
        $scope.adgroup3 = function(adg) {
          $scope.currentAdGroup3 = adg;
          $scope.loadKeywords(7, $scope.model7);
        };
        $scope.currentAdGroup4 = null;
        $scope.adgroup4 = function(adg) {
          $scope.currentAdGroup4 = adg;
          $scope.loadKeywords(8, $scope.model8);
        };

        $scope.currentAdGroup5 = null;
        $scope.adgroup5 = function(adg) {
          $scope.currentAdGroup4 = adg;
          $scope.loadKeywords(9, $scope.model9);
        };

        $scope.filterFeature = {
          searchterms: {
            profitable: {
              searchterms_only: true
            },
            nonprofitable: {
              searchterms_only: true
            }
          }
        };

        $scope.onApplyFilterFeature = function(type) {
          if (type === 'searchterm_profitable') {
            $scope.loadKeywords(7, $scope.model7);
          } else if (type === 'searchterm_nonprofitable') {
            $scope.loadKeywords(8, $scope.model8);
          }
        };

        $scope.checkFeature = {
          all: {
            keyword: false,
            badkeyword: false,
            searchterm_profitable: false,
            searchterm_nonprofitable: false
          },
          selected: {
            keyword: [],
            badkeyword: [],
            searchterm_profitable: [],
            searchterm_nonprofitable: []
          }
        };

        $scope.onCheckFeatureAll = function(type) {
          if (type == 'keyword') {
            if ($scope.checkFeature.all.keyword) {
              $scope.checkFeature.selected.keyword = angular.copy($scope.keywords);
            } else {
              $scope.checkFeature.selected.keyword = [];
            }
          } else if (type == 'badkeyword') {
            if ($scope.checkFeature.all.badkeyword) {
              $scope.checkFeature.selected.badkeyword = angular.copy($scope.badkeywords);
            } else {
              $scope.checkFeature.selected.badkeyword = [];
            }
          } else if (type == 'searchterm_profitable') {
            if ($scope.checkFeature.all.searchterm_profitable) {
              $scope.checkFeature.selected.searchterm_profitable = angular.copy($scope.profitableKeywords);
            } else {
              $scope.checkFeature.selected.searchterm_profitable = [];
            }
          } else if (type == 'searchterm_nonprofitable') {
            if ($scope.checkFeature.all.searchterm_nonprofitable) {
              $scope.checkFeature.selected.searchterm_nonprofitable = angular.copy($scope.nonProfitableKeywords);
            } else {
              $scope.checkFeature.selected.searchterm_nonprofitable = [];
            }
          }
        };

        $scope.onCheckFeatureOne = function(type) {
          if (type == 'keyword') {
            $scope.checkFeature.all.keyword = $scope.checkFeature.selected.keyword.length == $scope.keywords.length;
          } else if (type == 'badkeyword') {
            $scope.checkFeature.all.badkeyword = $scope.checkFeature.selected.badkeyword.length == $scope.badkeywords.length;
          } else if (type == 'searchterm_profitable') {
            $scope.checkFeature.all.searchterm_profitable = $scope.checkFeature.selected.searchterm_profitable.length == $scope.profitableKeywords.length;
          } else if (type == 'searchterm_nonprofitable') {
            $scope.checkFeature.all.searchterm_nonprofitable = $scope.checkFeature.selected.searchterm_nonprofitable.length == $scope.nonProfitableKeywords.length;
          }
        };

        $scope.toggleSelectAll = function() {
          $scope.selallwords = !$scope.selallwords;
          $scope.negativeKeywords.forEach(function (keyword) {
            keyword.selected = $scope.selallwords;
          });
        };

        $scope.toggleSelectKeyword = function(keyword) {
          keyword.selected = !keyword.selected;
        };
      }
    ]);
}());
