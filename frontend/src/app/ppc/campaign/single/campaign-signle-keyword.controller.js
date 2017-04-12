(function() {
  'use strict';
  angular.module('frontend.ppc.campaign')
    .controller('SingleCampaignKeywordController', [
      '$scope', '$rootScope', '$stateParams', 'MessageService', '$filter', '$modal',
      'SkuModalService', 'NegateLogModel', 'UserService', 'CampaignModel', 'DTOptionsBuilder', '$timeout',
      function controller($scope, $rootScope, $stateParams, MessageService, $filter, $modal,
        SkuModalService, NegateLogModel, UserService, CampaignModel, DTOptionsBuilder, $timeout) {

        $scope.user = UserService.user();
        $stateParams.campaign = $rootScope.decodeURL($stateParams.campaign);
        $scope.campaignId = $stateParams.id;
        $scope.campaignName = $stateParams.campaign;

        $scope.datePicker = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days')
          },
        };

        $scope.dateRangeForOptimizer = {
          startDate: moment().subtract(37, 'days'),
          endDate: moment().subtract(7, 'days'),
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
              dateUpdated();
            }
          }
        };

        $scope.dateRangeOptionsForOptimizer = {
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
              loadKeywordsForOptimizer();
            },
          },
        };

        $timeout(function() {
          $('.keyword-op-tab-container a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var targetId = $(e.target).data('target');
            $rootScope.$broadcast('tab-changed', {
              page: 'keyword',
              tabId: targetId,
            });
          });
        }, 500);

        $scope.model1 = {};
        $scope.model2 = {};

        $scope.modeloptions1 = {};
        $scope.modeloptions2 = {};

        $scope.ApplyModel = function(i, location) {
          var saveacosToLoad = $scope.saveacos;
          if (!saveacosToLoad) {
            saveacosToLoad  = $scope.$parent.currentSetting.average_acos;
          }

          switch (i) {
            case 2:
              // Load profitable keywords.
              var filterOptions = {
                campaign: $stateParams.campaign,
                user: $scope.user.id,
                adgroup: $scope.currentAdGroup1,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                saveacos : saveacosToLoad,
                order: 'DESC',
              };

              var fields = [
                'profitfrom', 'profitto',
                'revenuefrom', 'revenueto',
                'adspendfrom', 'adspendto',
                'impressionsfrom', 'impressionsto',
                'clicksfrom', 'clicksto',
                'ctrfrom', 'ctrto',
                'avecpcfrom', 'avecpcto',
                'ordersFrom', 'ordersTo',
                'conversionRateFrom', 'conversionRateTo',
                'acosfrom', 'acosto',
                'match1',
              ];

              fields.forEach(function (field) {
                if (typeof $scope.model2[field] !== 'undefined' && $scope.model2[field] !== null && $scope.model2[field] !== '') {
                  filterOptions[field] = $scope.model2[field];
                }
              });

              CampaignModel.keywordsForCampaignAcos(filterOptions)
                .then(function(response) {
                  $scope.adClick = true;
                  $scope.keywords = response;
                  $scope.selectedKeyword = $scope.keywords.length > 0 ? $scope.keywords[0].Keyword : '';

                  CampaignModel.getChartbyKeyword({
                      user: $scope.user.id,
                      keyword: $scope.selectedKeyword,
                      campaign: $stateParams.campaign,
                      startDate: $scope.datePicker.date.startDate,
                      endDate: $scope.datePicker.date.endDate,
                    })
                    .then(function(response) {
                      $scope.charts1 = response;
                      $scope.data1 = [];
                      $scope.data1[0] = {
                        key: "Gross Revenue",
                        mean: 250,
                        values: []
                      };

                      $scope.charts1.forEach(function(item, i, arr) {
                        var rr = new Date(item.EndDate).getTime();
                        $scope.data1[0].values.push([rr, item.Revenue]);
                      });

                      $scope.data1[1] = {
                        key: "Net Revenue",
                        mean: 250,
                        values: []
                      };

                      $scope.charts1.forEach(function(item, i, arr) {
                        var rr = new Date(item.EndDate).getTime();
                        $scope.data1[1].values.push([rr, item.Revenue - item.Cost]);
                      });

                      $scope.data1[3] = {
                        key: "Profit",
                        mean: 250,
                        values: []
                      };

                      $scope.charts1.forEach(function(item, i, arr) {
                        var rr = new Date(item.EndDate).getTime();
                        var nn = item.Profit;

                        $scope.data1[3].values.push([rr, nn]);
                      });

                      $scope.data1[4] = {
                        key: "Impressions",
                        mean: 250,
                        values: []
                      };

                      $scope.charts1.forEach(function(item, i, arr) {
                        var rr = new Date(item.EndDate).getTime();
                        var nn = item.Impressions;

                        $scope.data1[4].values.push([rr, nn]);
                      });

                      $scope.data1[2] = {
                        key: "Ad Spend",
                        mean: 250,
                        values: []
                      };

                      $scope.charts1.forEach(function(item, i, arr) {
                        var rr = new Date(item.EndDate).getTime();
                        $scope.data1[2].values.push([rr, item.Cost]);
                      });
                      $scope.options1 = {
                        chart: {
                          type: 'lineChart',
                          height: 450,
                          margin: {
                            top: 20,
                            right: 20,
                            bottom: 50,
                            left: 85
                          },
                          x: function(d) {
                            return d[0];
                          },
                          y: function(d) {
                            return d[1];
                          },

                          color: d3.scale.category10().range(),
                          duration: 300,
                          useInteractiveGuideline: true,
                          clipVoronoi: false,
                          // yDomain: [0, d3.max(function (d) { return d.v; }) ],
                          xAxis: {
                            axisLabel: 'Date',
                            tickFormat: function(d) {
                              return d3.time.format('%b %d')(new Date(d));
                            }
                          },
                          yAxis: {
                            axisLabel: 'Data',
                            tickFormat: function(d) {
                              return d3.format('.02f')(d);
                            },
                            axisLabelDistance: -10
                          },
                        }
                      };
                    });
                });
              break;
            case 1:
              // Load unprofitable keywords.
              var filterOptions = {
                campaign: $stateParams.campaign,
                user: $scope.user.id,
                adgroup: $scope.currentAdGroup2,
                startDate: $scope.datePicker.date.startDate,
                endDate: $scope.datePicker.date.endDate,
                saveacos : saveacosToLoad,
                order: 'ASC',
              };

              var fields = [
                'profitfrom', 'profitto',
                'revenuefrom', 'revenueto',
                'adspendfrom', 'adspendto',
                'impressionsfrom', 'impressionsto',
                'clicksfrom', 'clicksto',
                'ctrfrom', 'ctrto',
                'avecpcfrom', 'avecpcto',
                'ordersFrom', 'ordersTo',
                'conversionRateFrom', 'conversionRateTo',
                'acosfrom', 'acosto',
                'match1',
              ];

              fields.forEach(function (field) {
                if (typeof $scope.model1[field] !== 'undefined' && $scope.model1[field] !== null && $scope.model1[field] !== '') {
                  filterOptions[field] = $scope.model1[field];
                }
              });

              CampaignModel.keywordsForCampaignAcos(filterOptions)
                .then(function(response) {
                  $scope.adClick = true;
                  $scope.badkeywords = response;
                  $scope.selectedbadKeyword = $scope.badkeywords.length > 0 ? $scope.badkeywords[0].Keyword : '';
                  CampaignModel.getallgroups({
                      user: $scope.user.id,
                      campaign: $stateParams.campaign,
                      startDate: $scope.datePicker.date.startDate,
                      endDate: $scope.datePicker.date.endDate,
                    })
                    .then(function(response) {
                      $scope.unique = response;
                    });
                });
              break;
            default:
          }
        };

        $scope.modelload = function(j, i) {
          var loadmodel = CampaignModel.loadmodel({
            user: $scope.user.id,
            id: i
          })
          .then(function(response) {
            eval('$scope.model' + j + ' =  response[0];');
          });
        };

        $scope.modelOptionsload = function(j, i) {
          var loadmodel = CampaignModel.loadmodels({
            user: $scope.user.id,
            modelno: i
          })
          .then(function(response) {
            eval('$scope.modeloptions' + j + ' =  response;');
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
              $scope.modelOptionsload(i-2,i);
            });
        };

        function initialLoadData() {
          $scope.ApplyModel(1);
          $scope.ApplyModel(2);
        }

        function dateUpdated() {
          initialLoadData();
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
        $scope.$on('CAMPAIGN_KEYWORDS_TAB_LOADED', function () {
          if($scope.isFirstTime) {
            $scope.KPI = $scope.$parent.KPI;
            $scope.saveacos = $scope.KPI.acos1;
            $scope.datePicker.date = $scope.$parent.datePicker.date;
            initialLoadData();

            $scope.modelOptionsload(1,3);
            $scope.modelOptionsload(2,4);

            $scope.isFirstTime = false;
          } else if ($scope.dateUpdatedFlag) {
              $scope.datePicker.date = $scope.$parent.datePicker.date;
              dateUpdated();
              $scope.dateUpdatedFlag = false;
          }
        });

        $scope.$on('CAMPAIGN_KPI_UPDATED', function() {
          $scope.KPI = $scope.$parent.KPI;
          $scope.saveacos = $scope.KPI.acos1;
        });

        // END  LOAD MODEL

        // BEGIN COPY ALL, ADD SEARCH //

        $scope.copiedkeywords1 = '';
        $scope.copiedkeywordsmatrix1 = [];

        $scope.copyall1 = function() {
          $scope.copiedkeywords1 = '';
          $scope.copiedkeywordsmatrix1 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.keyword.length - 1; i++) {
            $scope.copiedkeywordsmatrix1.push($scope.checkFeature.selected.keyword[i].Keyword);
          }

          $scope.copiedkeywords1 = $scope.copiedkeywordsmatrix1.toString().replace(/,/g, '\n');
        };

        $scope.copyall_badkeywords = function() {
          $scope.copiedkeywords1 = '';
          $scope.copiedkeywordsmatrix1 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.badkeyword.length - 1; i++) {
            $scope.copiedkeywordsmatrix1.push($scope.checkFeature.selected.badkeyword[i].Keyword);
          }

          $scope.copiedkeywords1 = $scope.copiedkeywordsmatrix1.toString().replace(/,/g, '\n');
        };

        $scope.addsearch1 = function(keyword) {
          // search and remove the string.
          var found = false;
          for (var i = $scope.copiedkeywordsmatrix1.length - 1; i >= 0; i--) {
            if ($scope.copiedkeywordsmatrix1[i] === keyword) {
              $scope.copiedkeywordsmatrix1.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            //if didnt found push it to the bottom
            $scope.copiedkeywordsmatrix1.push(keyword)
          }
          //rebuild
          $scope.copiedkeywords1 = $scope.copiedkeywordsmatrix1.toString().replace(/,/g, '\n');
        };

        // END COPY ALL, ADD SEARCH //

        // ------ BEGIN DATATABLE --------------

        $scope.$on('CURRENCY_UPDATED', function() {
          $scope.reloadDataTables();
        });

        $scope.dtInstances = {};

        $scope.reloadDataTables = function() {
          _.map($scope.dtInstances, function(_instance, type) {
            _instance.rerender();
          });
        };

        $scope.dtInstanceCallbackKeyPro = function(_instance) {
          $scope.dtInstances.KeyPro = _instance;
        };

        $scope.dtInstanceCallbackKeyUnPro = function(_instance) {
          $scope.dtInstances.KeyUnPro = _instance;
        };

        $scope.dtInstanceCallbackOptimizer = function(_instance) {
          $scope.dtInstances.Optimizer = _instance;
        };

        $scope.dtInstanceCallbackRelatedTerms = function(_instance) {
          $scope.dtInstances.RelatedTerms = _instance;
        };

        $scope.dtInstanceCallbackTermsWithoutSales = function(_instance) {
          $scope.dtInstances.TermsWithoutSales = _instance;
        };

        $scope.adClick = false;

        $scope.dtOptions_key_pro = DTOptionsBuilder.newOptions()
          .withOption('lengthMenu', [
            [5, 10, 25, 50, 100, -1],
            [5, 10, 25, 50, 100, 'All']
          ])
          .withFixedHeader({
              bottom: true
          })
          .withOption('scrollX', '100%')
          .withOption('aaSorting', [
            [2, 'desc']
          ])
          .withOption('pageLength', $rootScope._dtSetting.length['key_pro'])
          .withButtons([{
              text: 'Copy To Clipboard Below',
              action: function() {
                $scope.copyall1();
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
            }
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['key_pro']);
            }
            $rootScope._dtSetting.save('key_pro', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('fnDrawCallback', function() {
            var api = this.api();
            var pagesum = [];
            for (var i = 3; i <= 10; i++) {
              pagesum[i] = api.column(i, {
                  page: 'current'
                }).data()
                .reduce(function(a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);
              if (i <= 5) {
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
              } else if (i == 6) {
                $(api.column(i).footer()).html(((pagesum[5] / pagesum[4] * 100).toFixed(2)).toLocaleString());
              } else if (i == 9) {
                $(api.column(i).footer()).html((pagesum[5] / pagesum[8]).toFixed(2).toLocaleString());
              } else {
                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
              }
            }
          });

        $scope.dtOptions_key_unpro = DTOptionsBuilder.newOptions()
          .withOption('scrollX', '100%')
          .withOption('lengthMenu', [
            [5, 10, 25, 50, 100, -1],
            [5, 10, 25, 50, 100, 'All']
          ])
          .withOption('aaSorting', [
            [1, 'asc']
          ])
          .withButtons([{
              text: 'Copy To Clipboard Below',
              action: function() {
                $scope.$apply(function() {
                  $scope.copyall_badkeywords();
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
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick)
              api.page.len($rootScope._dtSetting.length['key_unpro']);
            $rootScope._dtSetting.save('key_unpro', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('pageLength', $rootScope._dtSetting.length['key_unpro'])
          .withOption('drawCallback', function() {
            var api = this.api();
            var pagesum = [];
            for (var i = 3; i <= 10; i++) {
              pagesum[i] = api.column(i, {
                  page: 'current'
                }).data()
                .reduce(function(a, b) {
                  return Number.intVal(a) + Number.intVal(b);
                }, 0);
              if (i <= 5)
                $(api.column(i).footer()).html($filter('convertToCurrency')(pagesum[i], 2));
              else if (i == 6)
                $(api.column(i).footer()).html((pagesum[5] / pagesum[4] * 100).toFixed(2).toLocaleString());
              else if (i == 9)
                $(api.column(i).footer()).html((pagesum[5] / pagesum[8]).toFixed(2).toLocaleString());
              else
                $(api.column(i).footer()).html(pagesum[i].toLocaleString());
            }
          });

        $scope.dtOptionsOptimizer = DTOptionsBuilder.newOptions()
            .withScroller()
            .withOption('scrollX', '100%')
            .withOption('scrollY', 400)
            .withOption('lengthMenu', [
              [10, 25, 50, 100, -1],
              [10, 25, 50, 100, 'All']
            ])
            .withOption('aaSorting', [
              [5, 'desc']
            ])
            .withOption('preDrawCallback', function(settings) {
              var api = this.api();
              if ($scope.adClick) {
                api.page.len($rootScope._dtSetting.length['keyword_optimizer']);
              }
              $rootScope._dtSetting.save('keyword_optimizer', settings._iDisplayLength);
              $scope.adClick = false;
            })
            .withOption('pageLength', $rootScope._dtSetting.length['keyword_optimizer']);

        $scope.dtOptionsTermsWithoutSales = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withOption('aaSorting', [
            [2, 'desc']
          ])
          .withButtons([
            {
              text: 'Copy To Clipboard Below',
              action: function() {
                copyTermsWithoutSalesToClipboard();
                $scope.$apply();
              }
            },
            {
              text: 'Add to Negative List',
              action: function() {
                addTermsWithoutSalesToNegativeList();
                $scope.$apply();
              }
            },
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['terms_without_sales']);
            }
            $rootScope._dtSetting.save('terms_without_sales', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('pageLength', $rootScope._dtSetting.length['terms_without_sales']);

        $scope.dtOptionsRelatedTerms = DTOptionsBuilder.newOptions()
          .withScroller()
          .withOption('scrollX', '100%')
          .withOption('scrollY', 400)
          .withOption('lengthMenu', [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, 'All']
          ])
          .withButtons([
            {
              text: 'Copy To Clipboard Below',
              action: function() {
                copyUnprofitableTermsToClipboard();
                $scope.$apply();
              }
            },
            {
              text: 'Add to Negative List',
              action: function() {
                addUnprofitableTermsToNegativeList();
                $scope.$apply();
              }
            },
          ])
          .withOption('preDrawCallback', function(settings) {
            var api = this.api();
            if ($scope.adClick) {
              api.page.len($rootScope._dtSetting.length['related_terms']);
            }
            $rootScope._dtSetting.save('related_terms', settings._iDisplayLength);
            $scope.adClick = false;
          })
          .withOption('pageLength', $rootScope._dtSetting.length['related_terms']);

        // ------ END DATATABLE --------------


        $scope.currentAdGroup1 = null;
        $scope.adgroup1 = function(adg) {
          $scope.currentAdGroup1 = adg;
          $scope.ApplyModel(2, $scope.model2);
        };

        $scope.currentAdGroup2 = null;
        $scope.adgroup2 = function(adg) {
          $scope.currentAdGroup2 = adg;
          $scope.ApplyModel(1, $scope.model1);
        };

        $scope.checkFeature = {
          all: {
            keyword: false,
            badkeyword: false,
            searchterm_profitable: false,
            searchterm_nonprofitable: false,
            terms_without_sales: false,
            unprofitable_terms: false,
          },
          selected: {
            keyword: [],
            badkeyword: [],
            searchterm_profitable: [],
            searchterm_nonprofitable: [],
            terms_without_sales: [],
            unprofitable_terms: [],
          }
        };

        $scope.onCheckFeatureAll = function(type) {
          if (type == 'keyword') {
            if ($scope.checkFeature.all.keyword) $scope.checkFeature.selected.keyword = angular.copy($scope.keywords);
            else $scope.checkFeature.selected.keyword = [];
          } else if (type == 'badkeyword') {
            if ($scope.checkFeature.all.badkeyword) $scope.checkFeature.selected.badkeyword = angular.copy($scope.badkeywords);
            else $scope.checkFeature.selected.badkeyword = [];
          } else if (type == 'searchterm_profitable') {
            if ($scope.checkFeature.all.searchterm_profitable) $scope.checkFeature.selected.searchterm_profitable = angular.copy($scope.keywords7);
            else $scope.checkFeature.selected.searchterm_profitable = [];
          } else if (type == 'searchterm_nonprofitable') {
            if ($scope.checkFeature.all.searchterm_nonprofitable) $scope.checkFeature.selected.searchterm_nonprofitable = angular.copy($scope.nonProfitableKeywords);
            else $scope.checkFeature.selected.searchterm_nonprofitable = [];
          }
        };

        $scope.onCheckFeatureOne = function(type) {
          if (type == 'keyword') {
            $scope.checkFeature.all.keyword = $scope.checkFeature.selected.keyword.length == $scope.keywords.length;
          } else if (type == 'badkeyword') {
            $scope.checkFeature.all.badkeyword = $scope.checkFeature.selected.badkeyword.length == $scope.badkeywords.length;
          } else if (type == 'searchterm_profitable') {
            $scope.checkFeature.all.searchterm_profitable = $scope.checkFeature.selected.searchterm_profitable.length == $scope.keywords7.length;
          } else if (type == 'searchterm_nonprofitable') {
            $scope.checkFeature.all.searchterm_nonprofitable = $scope.checkFeature.selected.searchterm_nonprofitable.length == $scope.nonProfitableKeywords.length;
          }
        };

        $scope.changestats = function(keyword) {
          $scope.selectedKeyword = keyword;
          CampaignModel.getChartbyKeyword({
              user: $scope.user.id,
              keyword: keyword,
              campaign: $stateParams.campaign,
              startDate: $scope.datePicker.date.startDate,
              endDate: $scope.datePicker.date.endDate
            })
            .then(function(response) {
              $scope.charts1 = response;
              $scope.data1 = [];
              $scope.data1[0] = {
                key: "Gross Revenue",
                mean: 250,
                values: []
              };

              $scope.charts1.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);

                $scope.data1[0].values.push([rr.getTime(), item.Revenue]);
              });

              $scope.data1[1] = {
                key: "Net Revenue",
                mean: 250,
                values: []
              };

              $scope.charts1.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);

                $scope.data1[1].values.push([rr.getTime(), item.Revenue - item.Cost]);
              });

              $scope.data1[3] = {
                key: "Profit",
                mean: 250,
                values: []
              };

              $scope.charts1.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);
                var nn = 0;
                nn = item.Profit;

                $scope.data1[3].values.push([rr.getTime(), nn]);
              });

              $scope.data1[4] = {
                key: "Impressions",
                mean: 250,
                values: []
              };

              $scope.charts1.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);
                var nn = 0;
                nn = item.Impressions;

                $scope.data1[4].values.push([rr.getTime(), nn]);
              });

              $scope.data1[2] = {
                key: "Ad Spend",
                mean: 250,
                values: []
              };

              $scope.charts1.forEach(function(item, i, arr) {
                var rr = new Date(item.EndDate);
                $scope.data1[2].values.push([rr.getTime(), item.Cost]);
              });
            });
        };

        $scope.isOptimizerTabVisible = false;
        $scope.optimizerKeywords = [];
        $scope.clipboardForRelatedUnprofitableTerms = [];
        $scope.clipboardForRelatedTermsWithoutSales = [];
        $scope.selectedKeywordForOptimizer = '';
        $scope.optimizerAdgroups = [];
        $scope.selectedAdgroupForOptimizer = null;

        // FIXME: Find a way to listen for tab changes.
        $scope.showOptimizerTab = function () {
          $scope.isOptimizerTabVisible = true;
          $('#table-keyword-optimizer').DataTable().columns.adjust();
          loadKeywordsForOptimizer();
        };

        $scope.hideOptimizerTab = function () {
          $scope.isOptimizerTabVisible = false;
        };

        $scope.showRelatedUnprofitableTerms = function (keyword) {
          CampaignModel.getRelatedUnprofitableTerms({
            user: $scope.user.id,
            campaign: $stateParams.campaign,
            keyword: keyword,
            acosProfitZone: $scope.saveacos,
            startDate: $scope.dateRangeForOptimizer.startDate,
            endDate: $scope.dateRangeForOptimizer.endDate,
          }).then(function (response) {
            $scope.selectedKeywordForOptimizer = keyword;

            $scope.relatedTermsWithoutSales = response.termsWithoutSales;
            $scope.relatedUnprofitableTerms = response.unprofitableTerms;
          });
        };

        $scope.addRelatedTermWithoutSalesToClipboard = function(term) {
          var found = false;
          for (var i = $scope.clipboardForRelatedTermsWithoutSales.length - 1; i >= 0; i--) {
            if ($scope.clipboardForRelatedTermsWithoutSales[i] === term) {
              $scope.clipboardForRelatedTermsWithoutSales.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            $scope.clipboardForRelatedTermsWithoutSales.push(term);
          }

          $scope.copiedkeywords1 = $scope.clipboardForRelatedTermsWithoutSales.toString().replace(/,/g, '\n');
        };

        $scope.addRelatedUnprofitableTermToClipboard = function(term) {
          var found = false;
          for (var i = $scope.clipboardForRelatedUnprofitableTerms.length - 1; i >= 0; i--) {
            if ($scope.clipboardForRelatedUnprofitableTerms[i] === term) {
              $scope.clipboardForRelatedUnprofitableTerms.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            $scope.clipboardForRelatedUnprofitableTerms.push(term);
          }

          $scope.copiedkeywords1 = $scope.clipboardForRelatedUnprofitableTerms.toString().replace(/,/g, '\n');
        };

        $scope.onCheckAllTermsWithoutSales = function (value) {
          if (value) {
            $scope.checkFeature.selected.terms_without_sales = angular.copy($scope.relatedTermsWithoutSales);
          } else {
            $scope.checkFeature.selected.terms_without_sales = [];
          }
        };

        $scope.onCheckAllUnprofitableTerms = function (value) {
          if (value) {
            $scope.checkFeature.selected.unprofitable_terms = angular.copy($scope.relatedUnprofitableTerms);
          } else {
            $scope.checkFeature.selected.unprofitable_terms = [];
          }
        };

        $scope.onCheckTermsWithoutSales = function () {
          $scope.checkFeature.all.terms_without_sales = $scope.checkFeature.selected.terms_without_sales.length == $scope.relatedTermsWithoutSales.length;
        };

        $scope.onCheckUnprofitableTerms = function () {
          $scope.checkFeature.all.unprofitable_terms = $scope.checkFeature.selected.unprofitable_terms.length == $scope.relatedUnprofitableTerms.length;
        };

        $scope.selectAdgroupForOptimizer = function (adgroup) {
          $scope.selectedAdgroupForOptimizer = adgroup ? adgroup : null;
          // FIXME: Keywords can be filtered locally without accessing DB.
          loadKeywordsForOptimizer();
        };

        function loadKeywordsForOptimizer() {
          var filterOptions = {
            campaign: $stateParams.campaign,
            user: $scope.user.id,
            startDate: $scope.dateRangeForOptimizer.startDate,
            endDate: $scope.dateRangeForOptimizer.endDate,
          };

          if ($scope.selectedAdgroupForOptimizer) {
            filterOptions.adgroup = $scope.selectedAdgroupForOptimizer;
          }

          CampaignModel.keywordsForOptimizer(filterOptions)
            .then(function (response) {
              $scope.optimizerKeywords = response;

              CampaignModel.getallgroups({
                  campaign: $stateParams.campaign,
                  user: $scope.user.id,
                })
                .then(function (response) {
                  $scope.optimizerAdgroups = response;
                });
            });
        }

        function copyTermsWithoutSalesToClipboard() {
          $scope.clipboardForRelatedTermsWithoutSales = [];

          for (var i = 0; i <= $scope.checkFeature.selected.terms_without_sales.length - 1; i++) {
            $scope.clipboardForRelatedTermsWithoutSales.push($scope.checkFeature.selected.terms_without_sales[i].term);
          }

          $scope.copiedkeywords1 = $scope.clipboardForRelatedTermsWithoutSales.toString().replace(/,/g, '\n');
        }

        function copyUnprofitableTermsToClipboard() {
          $scope.clipboardForRelatedUnprofitableTerms = [];

          for (var i = 0; i <= $scope.checkFeature.selected.unprofitable_terms.length - 1; i++) {
            $scope.clipboardForRelatedUnprofitableTerms.push($scope.checkFeature.selected.unprofitable_terms[i].term);
          }

          $scope.copiedkeywords1 = $scope.clipboardForRelatedUnprofitableTerms.toString().replace(/,/g, '\n');
        }

        // FIXME: Use the shared code with addUnprofitableTermsToNegativeList().
        function addTermsWithoutSalesToNegativeList() {
          var termsList = [];

          for (var i = 0; i <= $scope.checkFeature.selected.terms_without_sales.length - 1; i++) {
            termsList.push($scope.checkFeature.selected.terms_without_sales[i].term);
          }

          if (!termsList.length) {
            return;
          }

          SkuModalService.setMetaData($scope.user.id, 0, $scope.$parent.campaignSKUs);

          var modalInstance = $modal.open({
            templateUrl: '/frontend/ppc/campaign/partials/sku-modal.html',
            controller: 'SkuNegateModalController',
            windowClass: 'app-modal-window'
          });

          modalInstance.result.then(function (selectedItem) {
            if (!selectedItem.length) {
              return;
            }

            var selectedSkus = selectedItem.map(function (item) {
              return item.SKU;
            });

            NegateLogModel.bulkCreate({
              user : $scope.user.id,
              keywordType : 0, //Keyword Type value for Exact  = 0, 1 means phrase
              keywords : termsList,
              skus : selectedSkus
            })
            .then(function () {
              MessageService.success('Added to Negative Exact List');
            });
          });
        }

        function addUnprofitableTermsToNegativeList() {
          var termsList = [];

          for (var i = 0; i <= $scope.checkFeature.selected.unprofitable_terms.length - 1; i++) {
            termsList.push($scope.checkFeature.selected.unprofitable_terms[i].term);
          }

          if (!termsList.length) {
            return;
          }

          SkuModalService.setMetaData($scope.user.id, 0, $scope.$parent.campaignSKUs);

          var modalInstance = $modal.open({
            templateUrl: '/frontend/ppc/campaign/partials/sku-modal.html',
            controller: 'SkuNegateModalController',
            windowClass: 'app-modal-window'
          });

          modalInstance.result.then(function (selectedItem) {
            if (!selectedItem.length) {
              return;
            }

            var selectedSkus = selectedItem.map(function (item) {
              return item.SKU;
            });

            NegateLogModel.bulkCreate({
              user : $scope.user.id,
              keywordType : 0, //Keyword Type value for Exact  = 0, 1 means phrase
              keywords : termsList,
              skus : selectedSkus
            })
            .then(function () {
              MessageService.success('Added to Negative Exact List');
            });
          });
        }
      }
    ]);
  }());
