(function() {
  'use strict';

  // Controller to show single product on GUI.
  angular.module('frontend.ppc.power').service('DataService1', ['$rootScope',
      function($rootScope) {
        this.data = {};
        this.data.message = $rootScope.formodal;
        this.data.items = ['item1', 'item2', 'item3'];
      }
    ]).controller('myModal', ['$rootScope', '$scope', '$modalInstance', 'DataService1',
      function($rootScope, $scope, $modalInstance, dataService1) {
        $scope.data = dataService1.data;
        $scope.message = $rootScope.formodal;
        $scope.items = dataService1.data.items;

        $scope.selected = {
          item: $scope.items[0]
        };

        $scope.ok = function() {
          $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    ])
    .controller('PowerController', ['$rootScope', '$scope', '$state', '$stateParams', '$http',
      'UserService', 'MessageService', 'CampaignModel', 'ProductModel', 'BackendConfig',
      'DTOptionsBuilder', 'SettingsModel', '$timeout', '$modal', 'DataService1',
      function($rootScope, $scope, $state, $stateParams, $http,
        UserService, MessageService, CampaignModel, ProductModel, BackendConfig,
        DTOptionsBuilder, SettingsModel, $timeout, $modal, DataService1) {

        $(document).ready(function() {
          $timeout(function() {
            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
              setTimeout(function() {
                $.fn.dataTable.tables({
                  visible: true,
                  api: true,
                }).columns.adjust();
              }, 100);
            });
          }, 500);

           // -- BEGIN Process checkbox for Module 2
           var checkboxes = document.querySelectorAll('.chkFilterKeywordModule2');
           checkboxes.forEach(function(checkbox) {
             checkbox.addEventListener('click', handleCheck);
           })

           function handleCheck(e) {
             var checkedArr = [];
             var latestArr = [];
             var newArr = angular.copy(copiedModule2);
             var count = 0;
             checkboxes.forEach(function(checkbox) {
               if (checkbox.checked) {
                 checkedArr.push(checkbox.value);
               }
             });
             checkedArr.forEach(function(val) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === val;
                });
                latestArr = latestArr.concat(tempArr);
             })
             if (checkedArr.length >= 2) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === 'multiple';
                });
               latestArr = latestArr.concat(tempArr);
             }
            $scope.duplicates = latestArr;
           }
           // -- END Process checkbox for Module 2

           // -- BEGIN Process checkbox for Module 3
           var checkboxesMod3 = document.querySelectorAll('.chkFilterKeywordModule3');
           checkboxesMod3.forEach(function(checkbox) {
             checkbox.addEventListener('click', handleCheckMod3);
           })

           function handleCheckMod3(e) {
             var checkedArr = [];
             var latestArr = [];
             var newArr = angular.copy(copiedModule3);
             var count = 0;
             checkboxesMod3.forEach(function(checkbox) {
               if (checkbox.checked) {
                 checkedArr.push(checkbox.value);
               }
             });
             checkedArr.forEach(function(val) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === val;
                });
                latestArr = latestArr.concat(tempArr);
             })
             if (checkedArr.length >= 2) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === 'multiple';
                });
               latestArr = latestArr.concat(tempArr);
             }
             $scope.searchterms1 = latestArr;
           }
           // -- END Process checkbox for Module 3

           // -- BEGIN Process checkbox for Module 4
           var checkboxesMod4 = document.querySelectorAll('.chkFilterKeywordModule4');
           checkboxesMod4.forEach(function(checkbox) {
             checkbox.addEventListener('click', handleCheckMod4);
           })

           function handleCheckMod4(e) {
             var checkedArr = [];
             var latestArr = [];
             var newArr = angular.copy(copiedModule4);
             var count = 0;
             checkboxesMod4.forEach(function(checkbox) {
               if (checkbox.checked) {
                 checkedArr.push(checkbox.value);
               }
             });
             checkedArr.forEach(function(val) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === val;
                });
                latestArr = latestArr.concat(tempArr);
             })
             if (checkedArr.length >= 2) {
               var tempArr = newArr.filter(function(item) {
                   return item.Match1 === 'multiple';
                });
               latestArr = latestArr.concat(tempArr);
             }
             $scope.foundKeywords = latestArr;
           }
           // -- END Process checkbox for Module 4

          $scope.user = UserService.user();
          if ($rootScope.setUser > 0){
            $scope.user.id = $rootScope.setUser;
          }
          var cancelled_acc = SettingsModel.check_cancelled({
              user: $scope.user.id
            })
            .then(function(response) {
              if (response.status === 'cancelled') {
                $rootScope.status = 1;
                $state.go('ppc.settings');
              }
            });

          $scope.saveacos = angular.element('#saveacos').val();
          $rootScope.acoszone = angular.element('#saveacos').val();
          $scope.newmodel = {};
          $scope.newmode = 0;
          $scope.buckets = [];
          $scope.content_type = 0;
          $scope.SKUsToList = [];
          $scope.campaignsToList = [];
          $scope.$watch('content_type', function(newVal, oldVal) {
            $scope.showFindKeywordsResult = false;
            switch ($scope.content_type) {
              case '1':
                $rootScope.showme3 = true;
                $rootScope.showme4 = false;
                $rootScope.showme13 = false;
                $rootScope.showme31 = false;
                $scope.copiedkeywords1 = '';

                $scope.SKUsToList = $scope.SKUs;
                $scope.campaignsToList = $scope.campaigns1;

                break;

              case '2':
                $rootScope.showme3 = false;
                $rootScope.showme4 = false;
                $rootScope.showme13 = true;
                $rootScope.showme31 = false;

                $scope.SKUsToList = $scope.SKUs;
                $scope.campaignsToList = $scope.campaigns1;
                break;
              case '3':
                $rootScope.showme3 = false;
                $rootScope.showme4 = true;
                $rootScope.showme13 = false;
                $rootScope.showme31 = true;
                $scope.copiedkeywords1 = '';
                $scope.SKUsToList = $scope.SKUs;
                $scope.campaignsToList = $scope.campaigns1;
                break;
              case '4':
                {
                  $rootScope.showme3 = false;
                  $rootScope.showme4 = false;
                  $rootScope.showme13 = false;
                  $rootScope.showme31 = true;
                  $scope.copiedkeywords1 = '';
                  $scope.keywordsToSearch = '';
                  $scope.campaignsByKeywords = [];
                  $scope.SKUsByKeywords = [];
                  $scope.SKUsToList = [];
                  $scope.campaignsToList = [];
                  $scope.showFindKeywordsResult = true;
                  $scope.foundKeywords = [];
                  $scope.foundkeywordSearchTerms = [];
                  break;
                }
            }
            if (newVal != oldVal) {
              $scope.selection1 = [];
              $scope.selection2 = [];
            }
          });
        });

        var copiedModule2,
            copiedModule3,
            copiedModule4;
        function updateCopy(scope, moduleNum) {
          switch (moduleNum) {
            case '2':
               copiedModule2 = angular.copy(scope);
               break;
            case '3':
               copiedModule3 = angular.copy(scope);
               break;
            case '4':
               copiedModule4 = angular.copy(scope);
               break;
          }
        }

        $scope.checkFeature = {
          all: {
            keyword: false,
            searchterm: false
          },
          selected: {
            keyword: [],
            searchterm: []
          }
        };

        //Checking free or not free user and show popup warning
        // $('[data-toggle="tab"]').click(function(event) {
        //   event.preventDefault();
        //   if($(event.target).attr('data-target') == '#mtab2' || $(event.target).attr('data-target') == '#mtab3'){
        //     if(!$rootScope.settingsall || $rootScope.settingsall["0"].plan_id == "freemium") {
        //       $("#blockingFreeUserModal").modal();
        //       return false;
        //     }
        //   }
        // });

        //Go to settings page from (Blocking Free User)Modal's close button
        $scope.goSettings = function() {
          $('.modal-backdrop').hide();
          $state.go("ppc.settings");
        };

        //Go to manager campaign page after click (Add to existing Campaign) button
        $scope.goManagerCampaign = function(value) {
          $rootScope.noticeFlag = true;
          $rootScope.noticeText = "Please select a campaign to add "+value;
          $state.go("ppc.managerCampaign");
        };

        $scope.findCampaigns = function() {
          $scope.selection2 = [];
          ProductModel.searchSKUsByKeyword({
              keyword: $scope.keywordsToSearch,
              user: $scope.user.id
            })
            .then(function(response) {
              $scope.SKUsByKeywords = _.map(response, function(item) {
                return item.SKU;
              });

              $scope.SKUsToList = $scope.getSKUs();
            });

          CampaignModel.searchCampaignsByKeyword({
              keyword: $scope.keywordsToSearch,
              user: $scope.user.id
            })
            .then(function(response) {
              $scope.campaignsByKeywords = _.map(response, function(item) {
                return item.CampaignId;
              });

              $scope.campaignsToList = $scope.getCampaigns();
            });
        };

        $scope.onCheckFeatureAll = function(type) {
          $rootScope.searchTermSelected = [];
          if (type == 'keyword') {
            if ($scope.checkFeature.all.keyword) {
              $scope.checkFeature.selected.keyword = angular.copy($scope.searchterms);
              $rootScope.searchTermSelected = $scope.checkFeature.selected.keyword;
            }
            else $scope.checkFeature.selected.keyword = [];
          } else if (type == 'searchterm') {
            if ($scope.checkFeature.all.searchterm) $scope.checkFeature.selected.searchterm = angular.copy($scope.searchterms1);
            else $scope.checkFeature.selected.searchterm = [];
          }
        };

        $scope.onCheckFeatureOne = function(type) {
          $rootScope.searchTermSelected = [];
          $scope.checkFeature.selected.keyword.forEach(function(element) {
            $rootScope.searchTermSelected.push(element);
          }, this);
          if (type == 'keyword') {
            $scope.checkFeature.all.keyword = $scope.checkFeature.selected.keyword.length == $scope.searchterms.length;
          } else if (type == 'searchterm') {
            $scope.checkFeature.all.searchterm = $scope.checkFeature.selected.searchterm.length == $scope.searchterms1.length;
          }
        };

        $scope.uploadFilename = function(files) {
          if (files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
              var str = reader.result;
              var csv = str.split(/\n/);
              var result = [];
              var headers = csv[0].split(",");
              var str_result = "";
              for (var i = 1; i < csv.length - 1; i++) {
                var obj = {};
                var curline = csv[i].split(",");

                for (var j = 0; j < headers.length; j++) {
                  obj[j] = curline[j];
                }
                result.push(obj);
                var tmp = "";
                tmp += curline[1];
                if (i == csv.length - 2)
                  str_result += tmp.split('"').join('');
                else
                  str_result += tmp.split('"').join('') + '\n';
              }
              angular.element('#upload_keywords_list').val(str_result);
            };
            reader.readAsText(files[0]);
          }
        };

        $scope.uploadkeywords = function() {
          $rootScope.keywordFlag = true;

          if ($scope.selection2.length < 1) {
            MessageService.success('Please select some campaigns.');
            return;
          }

          $scope.showme1 = false;
          $scope.showme2 = true;
          $rootScope.selectedCampaigns1 = $scope.selection1;
          $rootScope.selectedCampaigns2 = $scope.selection2;
          $rootScope.selectedACoS1 = 99999999;
          $scope.campaignName1 = $rootScope.selectedCampaigns1;
          $scope.acoszone1 = 99999999;

          var filterOptions = {
            user: $scope.user.id,
            campaign: $rootScope.selectedCampaigns2,
            SKU: $scope.selection1,
          };

          var fields = [
            'match1',
          ];

          fields.forEach(function (field) {
            if (typeof $scope.model1[field] !== 'undefined' && $scope.model1[field] !== null && $scope.model1[field] !== '') {
              filterOptions[field] = $scope.model1[field];
            }
          });

          var keywordsList = angular.element('#upload_keywords_list').val().split("\n");

          $http.post(BackendConfig.url + '/api/upload_keywords?', {
            to_decode1: keywordsList,
            to_decode: filterOptions
          }).success(function(data) {
            MessageService.success('Keywords uploaded.');
            var matrix_uploaded_keywords = [];
            data.keywords.forEach(function(entry) {
              matrix_uploaded_keywords.push(entry)
            });
            $rootScope.keywordsList = matrix_uploaded_keywords;

            var bucket_flag = [];
            var bucket_no = 0;
            var bucket_ary = [];
            $scope.buckets = [];
            if (matrix_uploaded_keywords.length > 1000) {
              for (var i = 0; i < matrix_uploaded_keywords.length; i++) {
                bucket_no = parseInt(i / 1000);

                if (bucket_flag[bucket_no] != true) {
                  bucket_ary[bucket_no] = [];
                }
                bucket_ary[bucket_no][i - bucket_no * 1000] = matrix_uploaded_keywords[i];;
                bucket_flag[bucket_no] = true;
              }
              for (i = 0; i <= bucket_no; i++) {
                $scope.buckets[i] = {};
                $scope.buckets[i].no = Number.ordinal_suffix_of(i + 1) + ' ' + bucket_ary[i].length + ' keywords';
                $scope.buckets[i].content = bucket_ary[i].toString().replace(/,/g, '\n');
              }
            }
            $scope.copiedkeywords1 = matrix_uploaded_keywords.toString().replace(/,/g, '\n');
          });
        };

        $scope.datePickerFindKeywords = {};
        $scope.datePickerFindKeywords.date = {
          startDate: moment().subtract(37, 'days'),
          endDate: moment().subtract(7, 'days')
        };
        $scope.dateRangeOptionsFindKeywords = {
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
              $scope.findKeywords();
            }
          }
        };

        $scope.findKeywords = function() {
          if ($scope.selection2.length < 1) {
            MessageService.success('Please select some campaigns.');
            return;
          }
          $scope.showme1 = false;
          $scope.showme2 = false;
          $rootScope.selectedCampaigns1 = $scope.selection1;
          $rootScope.selectedCampaigns2 = $scope.selection2;
          $rootScope.selectedACoS1 = 99999999;
          $scope.campaignName1 = $rootScope.selectedCampaigns1;
          $scope.acoszone1 = 99999999;

          var filter = {};

          $rootScope.applyFilters($scope.model4, filter, {
            user: $scope.user.id,
            acosfrom1: 99999999,
            acostill: 0,
            campaign: $rootScope.selectedCampaigns2,
            keyword: $scope.keywordsToSearch,
            SKU: $scope.selection1,
            startDate: $scope.datePickerFindKeywords.date.startDate,
            endDate: $scope.datePickerFindKeywords.date.endDate
          });

          CampaignModel.findKeywords(filter)
            .then(function(response) {
              $scope.foundKeywords = response.keywords;
              $scope.foundkeywordSearchTerms = response.searchterms;
              $scope.showFindKeywordsResult = true;
              updateCopy($scope.foundKeywords, '4');
            });
        };

        $scope.findDuplicates = function() {
          if ($scope.selection2.length < 1) {
            MessageService.success('Please select some campaigns.');
            return;
          }
          $scope.showme1 = false;
          $scope.showme2 = true;
          $rootScope.selectedCampaigns1 = $scope.selection1;
          $rootScope.selectedCampaigns2 = $scope.selection2;
          $rootScope.selectedACoS1 = 99999999;
          $scope.campaignName1 = $rootScope.selectedCampaigns1;
          $scope.acoszone1 = 99999999;

          var testmodel1 = {};

          $rootScope.applyFilters1($scope.model3, testmodel1, {
            user: $scope.user.id,
            acosfrom1: 99999999,
            acostill: 0,
            campaign: $rootScope.selectedCampaigns2,
            SKU: $scope.selection1,
            startDate: null,
            endDate: null
          });

          CampaignModel.searchbyduplicates(testmodel1)
            .then(function(response) {
              $scope.duplicates = response;
              $scope.showme4 = true;
              updateCopy($scope.duplicates, '2');
            });
        };

        $scope.user = UserService.user();
        // Set current scope reference to models
        if ($rootScope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        }
        $scope.filterCopied = function(page, type) {
          if (page == 1)
            $scope.copiedkeywords = $scope.filtering($scope.copiedkeywords, type);
          if (page == 2) {
            $scope.copiedkeywords1 = $scope.filtering($scope.copiedkeywords1, type);
            for (var i = 0; i < $scope.buckets.length; i++)
              $scope.buckets[i].content = $scope.filtering($scope.buckets[i].content, type);
          }
        };
        $scope.filtering = function(data, type) {
          var resAry = [];
          var desAry = [];
          var tmpAry = [];
          var characters = "!@#$%^&*()";
          resAry = data.split('\n');
          if (type == 1) {
            for (var i = 0; i < resAry.length; i++) {
              tmpAry = resAry[i].split(' ');
              for (var j = 0; j < tmpAry.length; j++) {
                if (desAry.indexOf(tmpAry[j]) == -1)
                  desAry.push(tmpAry[j]);
              }
            }
            data = desAry.join('\n');
          }
          if (type == 2) {
            for (var i = 0; i < resAry.length; i++) {
              for (var j = 0; j < characters.length; j++)
                resAry[i] = resAry[i].replace(characters[j], '');
            }
            data = resAry.join('\n');
          }
          $rootScope.keywordsList = data.split('\n');
          return data;
        };
        var load = SettingsModel.getvalues({
            user: $scope.user.id
          })
          .then(function(response) {
            $timeout(function() {
              $rootScope.initCurrentCurrency();
            });

            $scope.countries2 = [];

            if (response.length > 0) {
              $scope.settingsall = response;
              angular.forEach(response, function(member, index) {
                //Just add the index to your item
                member.index = index;
                $scope.countries2.push(member.country_id);
                if (member.user == $scope.user.id) {
                    $scope.countries3 = member.country_id;
                }
              });

              $("#country1").countrySelect("destroy");
              $("#country1").countrySelect({
                onlyCountries: $scope.countries2
              });
              $("#country1").countrySelect("selectCountry", $scope.countries3);
            }
          });

        $rootScope.uploadFile = function(files) {
          $scope.showme1 = false;
          $scope.showme2 = true;
          var fd = new FormData();
          fd.append("0", files[0]); // Append the file
          fd.append("user", $scope.user.id);

          $rootScope.selectedCampaigns1 = $scope.selection1;
          $rootScope.selectedCampaigns2 = $scope.selection2;
          $rootScope.selectedACoS1 = 99999999;
          $scope.campaignName1 = $rootScope.selectedCampaigns1;
          $scope.acoszone1 = 99999999;

          var testmodel1 = {};

          if (typeof $scope.model1.profitfrom === "undefined" || $scope.model1.profitfrom === null) testmodel1.profitfrom = -99999999;
          else testmodel1.profitfrom = $scope.model1.profitfrom;
          if (typeof $scope.model1.profitto === "undefined" || $scope.model1.profitto === null) testmodel1.profitto = 99999999;
          else testmodel1.profitto = $scope.model1.profitto;
          if (typeof $scope.model1.revenuefrom === "undefined" || $scope.model1.revenuefrom === null) testmodel1.revenuefrom = -99999999;
          else testmodel1.revenuefrom = $scope.model1.revenuefrom;
          if (typeof $scope.model1.revenueto === "undefined" || $scope.model1.revenueto === null) testmodel1.revenueto = 99999999;
          else testmodel1.revenueto = $scope.model1.revenueto;
          if (typeof $scope.model1.adspendfrom === "undefined" || $scope.model1.adspendfrom === null) testmodel1.adspendfrom = -99999999;
          else testmodel1.adspendfrom = $scope.model1.adspendfrom;
          if (typeof $scope.model1.adspendto === "undefined" || $scope.model1.adspendto === null) testmodel1.adspendto = 99999999;
          else testmodel1.adspendto = $scope.model1.adspendto;
          if (typeof $scope.model1.acosfrom === "undefined" || $scope.model1.acosfrom === null) testmodel1.acosfrom = -99999999;
          else testmodel1.acosfrom = $scope.model1.acosfrom;
          if (typeof $scope.model1.acosto === "undefined" || $scope.model1.acosto === null) testmodel1.acosto = 99999999;
          else testmodel1.acosto = $scope.model1.acosto;
          if (typeof $scope.model1.impressionsfrom === "undefined" || $scope.model1.impressionsfrom === null) testmodel1.impressionsfrom = -99999999;
          else testmodel1.impressionsfrom = $scope.model1.impressionsfrom;
          if (typeof $scope.model1.impressionsto === "undefined" || $scope.model1.impressionsto === null) testmodel1.impressionsto = 99999999;
          else testmodel1.impressionsto = $scope.model1.impressionsto;
          if (typeof $scope.model1.clicksfrom === "undefined" || $scope.model1.clicksfrom === null) testmodel1.clicksfrom = -99999999;
          else testmodel1.clicksfrom = $scope.model1.clicksfrom;
          if (typeof $scope.model1.clicksto === "undefined" || $scope.model1.clicksto === null) testmodel1.clicksto = 99999999;
          else testmodel1.clicksto = $scope.model1.clicksto;
          if (typeof $scope.model1.ctrfrom === "undefined" || $scope.model1.ctrfrom === null) testmodel1.ctrfrom = -99999999;
          else testmodel1.ctrfrom = $scope.model1.ctrfrom;
          if (typeof $scope.model1.ctrto === "undefined" || $scope.model1.ctrto === null) testmodel1.ctrto = 99999999;
          else testmodel1.ctrto = $scope.model1.ctrto;
          if (typeof $scope.model1.avecpcfrom === "undefined" || $scope.model1.avecpcfrom === null) testmodel1.avecpcfrom = -99999999;
          else testmodel1.avecpcfrom = $scope.model1.avecpcfrom;
          if (typeof $scope.model1.avecpcto === "undefined" || $scope.model1.avecpcto === null) testmodel1.avecpcto = 99999999;
          else testmodel1.avecpcto = $scope.model1.avecpcto;
          if (typeof $scope.model1.ordersFrom === "undefined" || $scope.model1.ordersFrom === null || $scope.model1.ordersFrom === '') testmodel1.ordersFrom = -99999999;
          else testmodel1.ordersFrom = $scope.model1.ordersFrom;
          if (typeof $scope.model1.ordersTo === "undefined" || $scope.model1.ordersTo === null || $scope.model1.ordersTo === '') testmodel1.ordersTo = 99999999;
          else testmodel1.ordersTo = $scope.model1.ordersTo;
          if (typeof $scope.model1.conversionRateFrom === "undefined" || $scope.model1.conversionRateFrom === null || $scope.model1.conversionRateFrom === '') testmodel1.conversionRateFrom = -99999999;
          else testmodel1.conversionRateFrom = $scope.model1.conversionRateFrom;
          if (typeof $scope.model1.conversionRateTo === "undefined" || $scope.model1.conversionRateTo === null || $scope.model1.conversionRateTo === '') testmodel1.conversionRateTo = 99999999;
          else testmodel1.conversionRateTo = $scope.model1.conversionRateTo;
          if (typeof $scope.model1.match1 === "undefined" || $scope.model1.match1 === null) testmodel1.match1 = 'ANY';
          else testmodel1.match1 = $scope.model1.match1;

          var json_to_encode = {
            user: $scope.user.id,
            acosfrom1: 99999999,
            acostill: 0,
            campaign: $rootScope.selectedCampaigns2,
            SKU: $scope.selection1,
            profitfrom: testmodel1.profitfrom,
            profitto: testmodel1.profitto,
            revenuefrom: testmodel1.revenuefrom,
            revenueto: testmodel1.revenueto,
            adspendfrom: testmodel1.adspendfrom,
            adspendto: testmodel1.adspendto,
            acosfrom: testmodel1.acosfrom,
            acosto: testmodel1.acosto,
            impressionsfrom: testmodel1.impressionsfrom,
            impressionsto: testmodel1.impressionsto,
            clicksfrom: testmodel1.clicksfrom,
            clicksto: testmodel1.clicksto,
            ctrfrom: testmodel1.ctrfrom,
            ctrto: testmodel1.ctrto,
            avecpcfrom: testmodel1.avecpcfrom,
            avecpcto: testmodel1.avecpcto,
            ordersFrom: testmodel1.ordersFrom,
            ordersTo: testmodel1.ordersTo,
            conversionRateFrom: testmodel1.conversionRateFrom,
            conversionRateTo: testmodel1.conversionRateTo,
            match1: testmodel1.match1,
            startDate: null,
            endDate: null
          };

          var encoded = btoa(JSON.stringify(json_to_encode));

          $http.post('https://ppcentourage.com:1337/api/upload_keywords/?to_decode=' + encoded, fd, {
            withCredentials: true,
            headers: {
              'Content-Type': undefined
            },
            transformRequest: angular.identity
          }).success(function(data) {
            MessageService.success('Keywords uploaded.');
            var matrix_uploaded_keywords = [];
            data.keywords.forEach(function(entry) {
              matrix_uploaded_keywords.push(entry.Keyword)
            });
            $scope.copiedkeywords1 = matrix_uploaded_keywords.toString().replace(/,/g, '\n');
          }).error()
        };

        $scope.keywordModal = function(keyword) {};

        $scope.data = DataService1.data;

        $scope.showModal = function(keyword) {
          $rootScope.formodal = keyword;

          var filterOptions = {
            user: $scope.user.id,
            keyword: $rootScope.formodal,
            campaign: $rootScope.selectedCampaigns2,
            SKU: $scope.selection1,
            startDate: null,
            endDate: null,
          };

          var filterKeys = [
            'match1',
          ];
          filterKeys.forEach(function (key) {
            if (typeof $scope.model1[key] !== "undefined" && $scope.model1[key] !== null && $scope.model1[key] !== '') {
              filterOptions[key] = $scope.model1[key];
            }
          });

          CampaignModel.searchbykeyword(filterOptions)
            .then(function(response) {
              $rootScope.searchbykeyword = response;
            });

          var modalInstance = $modal.open({
            templateUrl: '/frontend/ppc/power/modal.html',
            controller: 'myModal',
            windowClass: 'app-modal-window'
          });

          modalInstance.result.then(function(selectedItem) {
            $scope.selected = selectedItem;
          });
        };

        $scope.ApplyModel = function(i, location) {
          var testmodel2 = {};
          var testmodel3 = {};

          $scope.saveacos = angular.element('#saveacos').val();
          $scope.saveacos1 = angular.element('#saveacos1').val();

          if (typeof $scope.model2.revenuefrom === "undefined" || $scope.model2.revenuefrom === null || $scope.model2.revenuefrom === '') testmodel2.revenuefrom = -99999999;
          else testmodel2.revenuefrom = $scope.model2.revenuefrom;
          if (typeof $scope.model2.revenueto === "undefined" || $scope.model2.revenueto === null || $scope.model2.revenueto === '') testmodel2.revenueto = 99999999;
          else testmodel2.revenueto = $scope.model2.revenueto;
          if (typeof $scope.model2.adspendfrom === "undefined" || $scope.model2.adspendfrom === null || $scope.model2.adspendfrom === '') testmodel2.adspendfrom = -99999999;
          else testmodel2.adspendfrom = $scope.model2.adspendfrom;
          if (typeof $scope.model2.adspendto === "undefined" || $scope.model2.adspendto === null || $scope.model2.adspendto === '') testmodel2.adspendto = 99999999;
          else testmodel2.adspendto = $scope.model2.adspendto;
          if (typeof $scope.model2.acosfrom === "undefined" || $scope.model2.acosfrom === null || $scope.model2.acosfrom === '') testmodel2.acosfrom = -99999999;
          else testmodel2.acosfrom = $scope.model2.acosfrom;
          if (typeof $scope.model2.acosto === "undefined" || $scope.model2.acosto === null || $scope.model2.acosto === '') testmodel2.acosto = 99999999;
          else testmodel2.acosto = $scope.model2.acosto;
          if (typeof $scope.model2.impressionsfrom === "undefined" || $scope.model2.impressionsfrom === null || $scope.model2.impressionsfrom === '') testmodel2.impressionsfrom = -99999999;
          else testmodel2.impressionsfrom = $scope.model2.impressionsfrom;
          if (typeof $scope.model2.impressionsto === "undefined" || $scope.model2.impressionsto === null || $scope.model2.impressionsto === '') testmodel2.impressionsto = 99999999;
          else testmodel2.impressionsto = $scope.model2.impressionsto;
          if (typeof $scope.model2.clicksfrom === "undefined" || $scope.model2.clicksfrom === null || $scope.model2.clicksfrom === '') testmodel2.clicksfrom = -99999999;
          else testmodel2.clicksfrom = $scope.model2.clicksfrom;
          if (typeof $scope.model2.clicksto === "undefined" || $scope.model2.clicksto === null || $scope.model2.clicksto === '') testmodel2.clicksto = 99999999;
          else testmodel2.clicksto = $scope.model2.clicksto;
          if (typeof $scope.model2.ctrfrom === "undefined" || $scope.model2.ctrfrom === null || $scope.model2.ctrfrom === '') testmodel2.ctrfrom = -99999999;
          else testmodel2.ctrfrom = $scope.model2.ctrfrom;
          if (typeof $scope.model2.ctrto === "undefined" || $scope.model2.ctrto === null || $scope.model2.ctrto === '') testmodel2.ctrto = 99999999;
          else testmodel2.ctrto = $scope.model2.ctrto;
          if (typeof $scope.model2.avecpcfrom === "undefined" || $scope.model2.avecpcfrom === null || $scope.model2.avecpcfrom === '') testmodel2.avecpcfrom = -99999999;
          else testmodel2.avecpcfrom = $scope.model2.avecpcfrom;
          if (typeof $scope.model2.avecpcto === "undefined" || $scope.model2.avecpcto === null || $scope.model2.avecpcto === '') testmodel2.avecpcto = 99999999;
          else testmodel2.avecpcto = $scope.model2.avecpcto;
          if (typeof $scope.model2.ordersFrom === "undefined" || $scope.model2.ordersFrom === null || $scope.model2.ordersFrom === '') testmodel2.ordersFrom = -99999999;
          else testmodel2.ordersFrom = $scope.model2.ordersFrom;
          if (typeof $scope.model2.ordersTo === "undefined" || $scope.model2.ordersTo === null || $scope.model2.ordersTo === '') testmodel2.ordersTo = 99999999;
          else testmodel2.ordersTo = $scope.model2.ordersTo;
          if (typeof $scope.model2.conversionRateFrom === "undefined" || $scope.model2.conversionRateFrom === null || $scope.model2.conversionRateFrom === '') testmodel2.conversionRateFrom = -99999999;
          else testmodel2.conversionRateFrom = $scope.model2.conversionRateFrom;
          if (typeof $scope.model2.conversionRateTo === "undefined" || $scope.model2.conversionRateTo === null || $scope.model2.conversionRateTo === '') testmodel2.conversionRateTo = 99999999;
          else testmodel2.conversionRateTo = $scope.model2.conversionRateTo;
          if (typeof $scope.model2.match1 === "undefined" || $scope.model2.match1 === null || $scope.model2.match1 === '') testmodel2.match1 = 'ANY';
          else testmodel2.match1 = $scope.model2.match1;

          if (typeof $scope.model3.profitfrom === "undefined" || $scope.model3.profitfrom === null || $scope.model3.profitfrom === '') testmodel3.profitfrom = -99999999;
          else testmodel3.profitfrom = $scope.model3.profitfrom;
          if (typeof $scope.model3.profitto === "undefined" || $scope.model3.profitto === null || $scope.model3.profitto === '') testmodel3.profitto = 99999999;
          else testmodel3.profitto = $scope.model3.profitto;
          if (typeof $scope.model3.revenuefrom === "undefined" || $scope.model3.revenuefrom === null || $scope.model3.revenuefrom === '') testmodel3.revenuefrom = -99999999;
          else testmodel3.revenuefrom = $scope.model3.revenuefrom;
          if (typeof $scope.model3.revenueto === "undefined" || $scope.model3.revenueto === null || $scope.model3.revenueto === '') testmodel3.revenueto = 99999999;
          else testmodel3.revenueto = $scope.model3.revenueto;
          if (typeof $scope.model3.adspendfrom === "undefined" || $scope.model3.adspendfrom === null || $scope.model3.adspendfrom === '') testmodel3.adspendfrom = -99999999;
          else testmodel3.adspendfrom = $scope.model3.adspendfrom;
          if (typeof $scope.model3.adspendto === "undefined" || $scope.model3.adspendto === null || $scope.model3.adspendto === '') testmodel3.adspendto = 99999999;
          else testmodel3.adspendto = $scope.model3.adspendto;
          if (typeof $scope.model3.acosfrom === "undefined" || $scope.model3.acosfrom === null || $scope.model3.acosfrom === '') testmodel3.acosfrom = -99999999;
          else testmodel3.acosfrom = $scope.model3.acosfrom;
          if (typeof $scope.model3.acosto === "undefined" || $scope.model3.acosto === null || $scope.model3.acosto === '') testmodel3.acosto = 99999999;
          else testmodel3.acosto = $scope.model3.acosto;
          if (typeof $scope.model3.impressionsfrom === "undefined" || $scope.model3.impressionsfrom === null || $scope.model3.impressionsfrom === '') testmodel3.impressionsfrom = -99999999;
          else testmodel3.impressionsfrom = $scope.model3.impressionsfrom;
          if (typeof $scope.model3.impressionsto === "undefined" || $scope.model3.impressionsto === null || $scope.model3.impressionsto === '') testmodel3.impressionsto = 99999999;
          else testmodel3.impressionsto = $scope.model3.impressionsto;
          if (typeof $scope.model3.clicksfrom === "undefined" || $scope.model3.clicksfrom === null || $scope.model3.clicksfrom === '') testmodel3.clicksfrom = -99999999;
          else testmodel3.clicksfrom = $scope.model3.clicksfrom;
          if (typeof $scope.model3.clicksto === "undefined" || $scope.model3.clicksto === null || $scope.model3.clicksto === '') testmodel3.clicksto = 99999999;
          else testmodel3.clicksto = $scope.model3.clicksto;
          if (typeof $scope.model3.ctrfrom === "undefined" || $scope.model3.ctrfrom === null || $scope.model3.ctrfrom === '') testmodel3.ctrfrom = -99999999;
          else testmodel3.ctrfrom = $scope.model3.ctrfrom;
          if (typeof $scope.model3.ctrto === "undefined" || $scope.model3.ctrto === null || $scope.model3.ctrto === '') testmodel3.ctrto = 99999999;
          else testmodel3.ctrto = $scope.model3.ctrto;
          if (typeof $scope.model3.avecpcfrom === "undefined" || $scope.model3.avecpcfrom === null || $scope.model3.avecpcfrom === '') testmodel3.avecpcfrom = -99999999;
          else testmodel3.avecpcfrom = $scope.model3.avecpcfrom;
          if (typeof $scope.model3.avecpcto === "undefined" || $scope.model3.avecpcto === null || $scope.model3.avecpcto === '') testmodel3.avecpcto = 99999999;
          else testmodel3.avecpcto = $scope.model3.avecpcto;
          if (typeof $scope.model3.ordersFrom === "undefined" || $scope.model3.ordersFrom === null || $scope.model3.ordersFrom === '') testmodel3.ordersFrom = -99999999;
          else testmodel3.ordersFrom = $scope.model3.ordersFrom;
          if (typeof $scope.model3.ordersTo === "undefined" || $scope.model3.ordersTo === null || $scope.model3.ordersTo === '') testmodel3.ordersTo = 99999999;
          else testmodel3.ordersTo = $scope.model3.ordersTo;
          if (typeof $scope.model3.conversionRateFrom === "undefined" || $scope.model3.conversionRateFrom === null || $scope.model3.conversionRateFrom === '') testmodel3.conversionRateFrom = -99999999;
          else testmodel3.conversionRateFrom = $scope.model3.conversionRateFrom;
          if (typeof $scope.model3.conversionRateTo === "undefined" || $scope.model3.conversionRateTo === null || $scope.model3.conversionRateTo === '') testmodel3.conversionRateTo = 99999999;
          else testmodel3.conversionRateTo = $scope.model3.conversionRateTo;
          if (typeof $scope.model3.match1 === "undefined" || $scope.model3.match1 === null || $scope.model3.match1 === '') testmodel3.match1 = 'ANY';
          else testmodel3.match1 = $scope.model3.match1;

          $scope.newmodel.revenuefrom = testmodel2.revenuefrom;
          $scope.newmodel.revenueto = testmodel2.revenueto;
          $scope.newmodel.adspendfrom = testmodel2.adspendfrom;
          $scope.newmodel.adspendto = testmodel2.adspendto;
          $scope.newmodel.impressionsfrom = testmodel2.impressionsfrom;
          $scope.newmodel.impressionsto = testmodel2.impressionsto;
          $scope.newmodel.clicksfrom = testmodel2.clicksfrom;
          $scope.newmodel.clicksto = testmodel2.clicksto;
          $scope.newmodel.ctrfrom = testmodel2.ctrfrom;
          $scope.newmodel.ctrto = testmodel2.ctrto;
          $scope.newmodel.acosfrom = testmodel2.acosfrom;
          $scope.newmodel.acosto = testmodel2.acosto;
          $scope.newmodel.avecpcfrom = testmodel2.avecpcfrom;
          $scope.newmodel.avecpcto = testmodel2.avecpcto;
          $scope.newmodel.ordersFrom = testmodel2.ordersFrom;
          $scope.newmodel.ordersTo = testmodel2.ordersTo;
          $scope.newmodel.conversionRateFrom = testmodel2.conversionRateFrom;
          $scope.newmodel.conversionRateTo = testmodel2.conversionRateTo;

          var filterKeys = [
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

          switch (i) {
            case 2:
              // When clicking on the filter button on search term expansion page.
              if ($scope.newmode == 0) {

                var filterOptions = {
                  user: $scope.user.id,
                  acosfrom1: $scope.saveacos,
                  acostill: 0,
                  campaign: $rootScope.selectedCampaigns,
                  SKU: $rootScope.selectedCampaigns5,
                  startDate: $scope.datePicker8.date.startDate,
                  endDate: $scope.datePicker8.date.endDate,
                };

                filterKeys.forEach(function (key) {
                  if (typeof $scope.model2[key] !== "undefined" && $scope.model2[key] !== null && $scope.model2[key] !== '') {
                    filterOptions[key] = $scope.model2[key];
                  }
                });

                CampaignModel.searchbyACoSmult(filterOptions)
                  .then(function (response) {
                    $scope.searchterms = response;
                  });
              } else {
                $scope.removeKeywords();
              }
              break;

            case 3:
              CampaignModel.searchbyduplicates({
                  user: $scope.user.id,
                  acosfrom1: 99999999,
                  acostill: 0,
                  campaign: $rootScope.selectedCampaigns2,
                  SKU: $scope.selection1,
                  profitfrom: testmodel3.profitfrom,
                  profitto: testmodel3.profitto,
                  revenuefrom: testmodel3.revenuefrom,
                  revenueto: testmodel3.revenueto,
                  adspendfrom: testmodel3.adspendfrom,
                  adspendto: testmodel3.adspendto,
                  acosfrom: testmodel3.acosfrom,
                  acosto: testmodel3.acosto,
                  impressionsfrom: testmodel3.impressionsfrom,
                  impressionsto: testmodel3.impressionsto,
                  clicksfrom: testmodel3.clicksfrom,
                  clicksto: testmodel3.clicksto,
                  ctrfrom: testmodel3.ctrfrom,
                  ctrto: testmodel3.ctrto,
                  avecpcfrom: testmodel3.avecpcfrom,
                  avecpcto: testmodel3.avecpcto,
                  ordersFrom: testmodel3.ordersFrom,
                  ordersTo: testmodel3.ordersTo,
                  conversionRateFrom: testmodel3.conversionRateFrom,
                  conversionRateTo: testmodel3.conversionRateTo,
                  match1: testmodel3.match1,
                  startDate: $scope.datePicker9.date.startDate,
                  endDate: $scope.datePicker9.date.endDate,
                })
                .then(function(response) {
                  $scope.duplicates = response;
                  $scope.showme4 = true;
                });
              break;

            case 1:
              var filterOptions = {
                user: $scope.user.id,
                acosfrom1: $scope.saveacos1,
                acostill: 0,
                campaign: $rootScope.selectedCampaigns2,
                SKU: $rootScope.selectedCampaigns1,
                startDate: null,
                endDate: null,
              };

              filterKeys.forEach(function (key) {
                if (typeof $scope.model1[key] !== "undefined" && $scope.model1[key] !== null && $scope.model1[key] !== '') {
                  filterOptions[key] = $scope.model1[key];
                }
              });

              CampaignModel.searchbyACoSmult1(filterOptions)
                .then(function(response) {
                  $scope.searchterms1 = response;
                });
              break;
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
              CampaignModel.loadmodels({
                  user: $scope.user.id,
                  modelno: i
                })
                .then(function(response) {
                  eval('$scope.modeloptions' + i + ' =  response;');
                });
            });
        };

        CampaignModel.loadmodels({
            user: $scope.user.id,
            modelno: 4
          })
          .then(function(response) {
            $scope.modeloptions2 = response;
            $scope.modeloptions3 = response;
            $scope.modeloptions4 = response;
          });

        $rootScope.model1 = {};
        $rootScope.model3 = {};
        $scope.model2 = {};
        $scope.model4 = {};

        CampaignModel.loadmodels({
            user: $scope.user.id,
            modelno: 3
          })
          .then(function(response) {
            $scope.modeloptions1 = response;
          });

        $rootScope.model1 = {};

        CampaignModel.gettopCampaigns({
            user: $scope.user.id,
            startDate: null,
            endDate: null
          })
          .then(function(response) {
            $scope.campaigns = response;

            // selected fruits
            $scope.selection = [];
          });

        $scope.dtOptions3 = DTOptionsBuilder.newOptions().withScroller().withOption('scrollX', '100%').withOption('scrollY', 400);
        $scope.dtOptions4 = DTOptionsBuilder.newOptions().withScroller().withOption('scrollX', '100%').withOption('scrollY', 400);

        CampaignModel.getallSKUs({
            user: $scope.user.id
          })
          .then(function(response) {
            $scope.SKUs = response;

            // selected fruits
            $scope.selection1 = [];
          });

        CampaignModel.getallcampaigns({
            user: $scope.user.id,
            SKU: 'none'
          })
          .then(function(response) {
            //Apply Uniq Filter
            if (Array.isArray(response)) {
              var smap = response.map(function (e1) {
                return e1.Campaign;
              });
              $scope.campaigns5 = response.filter(function(item, pos) {
                return smap.indexOf(item.Campaign) == pos;
              });
              $scope.campaigns1  = $scope.campaigns5;
            } else {
              $scope.campaigns1 = [];
              $scope.campaigns5 = [];
            }

            // selected fruits
            $scope.selection2 = [];
            $scope.selection5 = [];
            $scope.selection6 = [];
          });

        $scope.getSKUs = function() {
          return _.filter($scope.SKUs, function(item) {
            return $scope.content_type != 4 || ($scope.content_type == 4 && $scope.SKUsByKeywords.indexOf(item.SKU) != -1);
          });
        };
        $scope.getCampaigns = function() {
          return _.filter($scope.campaigns1, function(item) {
            return $scope.content_type != 4 || ($scope.content_type == 4 && $scope.campaignsByKeywords.indexOf(item.CampaignId) != -1);
          });
        };

        $scope.toggleSelection = function (campaign) {
          if (campaign === "1ALLSKUS1") {
            //revert
            if ($scope.selall) {
              $scope.campaigns.forEach(function(item, i, arr) {
                var idx = $scope.selection.indexOf(item.Campaign);
                // is currently selected
                if (idx > -1) {
                  $scope.selection.splice(idx, 1);
                }
              });
              $scope.selall = false;
            } else {
              $scope.campaigns.forEach(function(item, i, arr) {
                $scope.selection.push(item.Campaign);
              });
              $scope.selall = true;
            }
            //toggle all
          } else {
            var idx = $scope.selection.indexOf(campaign);
            // is currently selected
            if (idx > -1) {
              $scope.selection.splice(idx, 1);
            }
            // is newly selected
            else {
              $scope.selection.push(campaign);
            }
          }
        };
        $scope.selall1 = false;
        $scope.selall2 = false;

        $scope.setImageSm = function setImageSm($imageUrl) {
          return $imageUrl.replace('http://ecx.', 'https://images-na.ssl-');
        };

        $scope.toggleSKUSelection = function (sku) {
          if (sku === "1ALLSKUS1") {
            //revert
            if ($scope.selall1) {
              $scope.SKUs.forEach(function(item, i, arr) {
                var idx = $scope.selection1.indexOf(item.SKU);
                // is currently selected
                if (idx > -1) {
                  $scope.selection1.splice(idx, 1);
                }
              });
              $scope.selall1 = false;
            } else {
              $scope.SKUs.forEach(function(item, i, arr) {
                if ($scope.content_type != 4 || ($scope.content_type == 4 && $scope.SKUsByKeywords.indexOf(item.SKU) !== -1)) {
                  $scope.selection1.push(item.SKU);
                }
              });
              $scope.selall1 = true;
            }
            //toggle all
          }
          var idx = $scope.selection1.indexOf(sku);
          if (idx > -1) {
            // is currently selected
            $scope.selection1.splice(idx, 1);
          } else {
            // is newly selected
            $scope.selection1.push(sku);
          }
          CampaignModel.getallcampaigns({
              user: $scope.user.id,
              SKU: $scope.selection1
            })
            .then(function(response) {
              if (Array.isArray(response)) {
                $scope.campaigns1 = response;
              } else {
                $scope.campaigns1 = [];
              }
              $scope.campaignsToList = $scope.getCampaigns($scope.campaigns1);
            });
        };

        $scope.toggleSelection2 = function (campaign) {
          if (campaign === "1ALLSKUS1") {
            //revert
            if ($scope.selall2) {
              $scope.campaigns1.forEach(function(item, i, arr) {
                if ($scope.content_type != 4 || ($scope.content_type == 4 && $scope.campaignsByKeywords.indexOf(item.CampaignId) !== -1)) {
                  var idx = $scope.selection2.indexOf(item.Campaign);
                  // is currently selected
                  if (idx > -1) {
                    $scope.selection2.splice(idx, 1);
                  }
                }
              });
              $scope.selall2 = false;
            } else {
              $scope.campaigns1.forEach(function(item, i, arr) {
                if ($scope.content_type != 4 || ($scope.content_type == 4 && $scope.campaignsByKeywords.indexOf(item.CampaignId) !== -1)) {
                  $scope.selection2.push(item.Campaign);
                }
              });
              $scope.selall2 = true;
            }
            //toggle all
          }
          var idx = $scope.selection2.indexOf(campaign);
          // is currently selected
          if (idx > -1) {
            $scope.selection2.splice(idx, 1);
          }
          // is newly selected
          else {
            $scope.selection2.push(campaign);
          }
        };

        $scope.toggleSelection5 = function toggleSelection5(campaign) {

          if (campaign === "1ALLSKUS1") {
            //revert
            if ($scope.selall5) {
              $scope.SKUs.forEach(function(item, i, arr) {
                var idx = $scope.selection5.indexOf(item.SKU);
                // is currently selected
                if (idx > -1) {
                  $scope.selection5.splice(idx, 1);
                }
              });
              $scope.selall5 = false;
            } else {
              $scope.SKUs.forEach(function(item, i, arr) {
                $scope.selection5.push(item.SKU);
              });
              $scope.selall5 = true;
            }
            //toggle all
          }
          var idx = $scope.selection5.indexOf(campaign);
          // is currently selected
          if (idx > -1) {
            $scope.selection5.splice(idx, 1);
          }
          // is newly selected
          else {
            $scope.selection5.push(campaign);
          }
          var getallcampaigns = CampaignModel.getallcampaigns({
              user: $scope.user.id,
              SKU: $scope.selection5
            })
            .then(function(response) {
              //Apply Uniq Filter
              if (Array.isArray(response)) {
                var smap = response.map(function (e1) {
                  return e1.Campaign;
                });
                $scope.campaigns5 = response.filter(function(item, pos) {
                  return smap.indexOf(item.Campaign) == pos;
                });
                $rootScope.campaignsBySKU = $scope.campaigns5;
              } else {
                $scope.campaigns5 = [];
              }

              $scope.selall6 = false;
              $scope.selection6 = [];

            });
        };

        $scope.toggleSelection6 = function toggleSelection6(campaign) {
          if (campaign === "1ALLSKUS1") {
            //revert
            if ($scope.selall6) {
              $scope.campaigns5.forEach(function(item, i, arr) {
                var idx = $scope.selection6.indexOf(item.Campaign);
                // is currently selected
                if (idx > -1) {
                  $scope.selection6.splice(idx, 1);
                }
              });
              $scope.selall6 = false;
            } else {
              $scope.campaigns5.forEach(function(item, i, arr) {
                $scope.selection6.push(item.Campaign);
              });
              $scope.selall6 = true;
            }
            //toggle all
          }
          var idx = $scope.selection6.indexOf(campaign);
          // is currently selected
          if (idx > -1) {
            $scope.selection6.splice(idx, 1);
          }
          // is newly selected
          else {
            $scope.selection6.push(campaign);
          }
        };


        $scope.findSearchKeywords = function() {
          $rootScope.searchtermFlag = true;

          if ($scope.selection6.length < 1) {
            MessageService.success('Please select some campaigns.');
            return;
          }

          $scope.newmode = 0;
          $scope.saveacos = angular.element('#saveacos').val();
          $scope.saveacos1 = angular.element('#saveacos1').val();

          var filterOptions = {
            user: $scope.user.id,
            acosfrom1: $scope.saveacos,
            acostill: 0,
            campaign: $scope.selection6,
            SKU: $scope.selection5,
            startDate: $scope.datePicker8.date.startDate,
            endDate: $scope.datePicker8.date.endDate,
          };

          var filterKeys = [
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
          filterKeys.forEach(function (key) {
            if (typeof $scope.model1[key] !== "undefined" && $scope.model1[key] !== null && $scope.model1[key] !== '') {
              filterOptions[key] = $scope.model1[key];
            }
          });

          $scope.searchterms = [];
          CampaignModel.searchbyACoSmult(filterOptions)
            .then(function(response) {
              $scope.searchterms = response;
            });

          $scope.showme = true;
          $rootScope.selectedCampaigns = $scope.selection6;
          $rootScope.selectedCampaigns5 = $scope.selection5;
          $rootScope.selectedACoS = $scope.saveacos;

          $scope.campaignName = $rootScope.selectedCampaigns;
          $scope.acoszone = $rootScope.selectedACoS;

          $scope.copiedkeywords = '';
          $scope.copiedkeywordsmatrix = [];

          $scope.copyall = function() {
            $scope.copiedkeywords = '';
            $scope.copiedkeywordsmatrix = [];

            for (var i = 0; i <= $scope.checkFeature.selected.keyword.length - 1; i++) {
              $scope.copiedkeywordsmatrix.push($scope.checkFeature.selected.keyword[i].Search);
            }

            $scope.copiedkeywords = $scope.copiedkeywordsmatrix.toString().replace(/,/g, '\n');
          };

          $scope.addsearch = function(keyword) {
            // search and remove the string.
            var found = false;
            for (var i = $scope.copiedkeywordsmatrix.length - 1; i >= 0; i--) {
              if ($scope.copiedkeywordsmatrix[i] === keyword) {
                $scope.copiedkeywordsmatrix.splice(i, 1);
                found = true;
              }
            }
            if (!found) {
              //if didnt found push it to the bottom
              $scope.copiedkeywordsmatrix.push(keyword)
            }
            //rebuild
            $scope.copiedkeywords = $scope.copiedkeywordsmatrix.toString().replace(/,/g, '\n');
          };

          $scope.setacos = function() {
            CampaignModel.searchbyACoS({
                user: $scope.user.id,
                acosto: $scope.acoszone,
                acosfrom: 0,
                campaign: $stateParams.campaign,
                startDate: $scope.datePicker8.date.startDate,
                endDate: $scope.datePicker8.date.endDate
              })
              .then(function(response) {
                $scope.searchterms = response;
              });
          };
        };

        $scope.data = [];
        $scope.datePicker9 = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days')
          },
        };
        $scope.dateRangeOptions9 = {
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
              $scope.showme1 = false;
              $scope.showme2 = true;
              $rootScope.selectedCampaigns1 = $scope.selection1;
              $rootScope.selectedCampaigns2 = $scope.selection2;
              $rootScope.selectedACoS1 = 99999999;
              $scope.campaignName1 = $rootScope.selectedCampaigns1;
              $scope.acoszone1 = 99999999;

              var testmodel3 = {};

              if (typeof $scope.model3.profitfrom === "undefined" || $scope.model3.profitfrom === null) testmodel3.profitfrom = -99999999;
              else testmodel3.profitfrom = $scope.model3.profitfrom;
              if (typeof $scope.model3.profitto === "undefined" || $scope.model3.profitto === null) testmodel3.profitto = 99999999;
              else testmodel3.profitto = $scope.model3.profitto;
              if (typeof $scope.model3.revenuefrom === "undefined" || $scope.model3.revenuefrom === null) testmodel3.revenuefrom = -99999999;
              else testmodel3.revenuefrom = $scope.model3.revenuefrom;
              if (typeof $scope.model3.revenueto === "undefined" || $scope.model3.revenueto === null) testmodel3.revenueto = 99999999;
              else testmodel3.revenueto = $scope.model3.revenueto;
              if (typeof $scope.model3.adspendfrom === "undefined" || $scope.model3.adspendfrom === null) testmodel3.adspendfrom = -99999999;
              else testmodel3.adspendfrom = $scope.model3.adspendfrom;
              if (typeof $scope.model3.adspendto === "undefined" || $scope.model3.adspendto === null) testmodel3.adspendto = 99999999;
              else testmodel3.adspendto = $scope.model3.adspendto;
              if (typeof $scope.model3.acosfrom === "undefined" || $scope.model3.acosfrom === null) testmodel3.acosfrom = -99999999;
              else testmodel3.acosfrom = $scope.model3.acosfrom;
              if (typeof $scope.model3.acosto === "undefined" || $scope.model3.acosto === null) testmodel3.acosto = 99999999;
              else testmodel3.acosto = $scope.model3.acosto;
              if (typeof $scope.model3.impressionsfrom === "undefined" || $scope.model3.impressionsfrom === null) testmodel3.impressionsfrom = -99999999;
              else testmodel3.impressionsfrom = $scope.model3.impressionsfrom;
              if (typeof $scope.model3.impressionsto === "undefined" || $scope.model3.impressionsto === null) testmodel3.impressionsto = 99999999;
              else testmodel3.impressionsto = $scope.model3.impressionsto;
              if (typeof $scope.model3.clicksfrom === "undefined" || $scope.model3.clicksfrom === null) testmodel3.clicksfrom = -99999999;
              else testmodel3.clicksfrom = $scope.model3.clicksfrom;
              if (typeof $scope.model3.clicksto === "undefined" || $scope.model3.clicksto === null) testmodel3.clicksto = 99999999;
              else testmodel3.clicksto = $scope.model3.clicksto;
              if (typeof $scope.model3.ctrfrom === "undefined" || $scope.model3.ctrfrom === null) testmodel3.ctrfrom = -99999999;
              else testmodel3.ctrfrom = $scope.model3.ctrfrom;
              if (typeof $scope.model3.ctrto === "undefined" || $scope.model3.ctrto === null) testmodel3.ctrto = 99999999;
              else testmodel3.ctrto = $scope.model3.ctrto;
              if (typeof $scope.model3.avecpcfrom === "undefined" || $scope.model3.avecpcfrom === null) testmodel3.avecpcfrom = -99999999;
              else testmodel3.avecpcfrom = $scope.model3.avecpcfrom;
              if (typeof $scope.model3.avecpcto === "undefined" || $scope.model3.avecpcto === null) testmodel3.avecpcto = 99999999;
              else testmodel3.avecpcto = $scope.model3.avecpcto;
              if (typeof $scope.model3.ordersFrom === "undefined" || $scope.model3.ordersFrom === null || $scope.model3.ordersFrom === '') testmodel3.ordersFrom = -99999999;
              else testmodel3.ordersFrom = $scope.model3.ordersFrom;
              if (typeof $scope.model3.ordersTo === "undefined" || $scope.model3.ordersTo === null || $scope.model3.ordersTo === '') testmodel3.ordersTo = 99999999;
              else testmodel3.ordersTo = $scope.model3.ordersTo;
              if (typeof $scope.model3.conversionRateFrom === "undefined" || $scope.model3.conversionRateFrom === null || $scope.model3.conversionRateFrom === '') testmodel3.conversionRateFrom = -99999999;
              else testmodel3.conversionRateFrom = $scope.model3.conversionRateFrom;
              if (typeof $scope.model3.conversionRateTo === "undefined" || $scope.model3.conversionRateTo === null || $scope.model3.conversionRateTo === '') testmodel3.conversionRateTo = 99999999;
              else testmodel3.conversionRateTo = $scope.model3.conversionRateTo;
              if (typeof $scope.model3.match1 === "undefined" || $scope.model3.match1 === null) testmodel3.match1 = 'ANY';
              else testmodel3.match1 = $scope.model3.match1;

              CampaignModel.searchbyduplicates({
                  user: $scope.user.id,
                  acosfrom1: 99999999,
                  acostill: 0,
                  campaign: $rootScope.selectedCampaigns2,
                  SKU: $scope.selection1,
                  profitfrom: testmodel3.profitfrom,
                  profitto: testmodel3.profitto,
                  revenuefrom: testmodel3.revenuefrom,
                  revenueto: testmodel3.revenueto,
                  adspendfrom: testmodel3.adspendfrom,
                  adspendto: testmodel3.adspendto,
                  acosfrom: testmodel3.acosfrom,
                  acosto: testmodel3.acosto,
                  impressionsfrom: testmodel3.impressionsfrom,
                  impressionsto: testmodel3.impressionsto,
                  clicksfrom: testmodel3.clicksfrom,
                  clicksto: testmodel3.clicksto,
                  ctrfrom: testmodel3.ctrfrom,
                  ctrto: testmodel3.ctrto,
                  avecpcfrom: testmodel3.avecpcfrom,
                  avecpcto: testmodel3.avecpcto,
                  ordersFrom: testmodel3.ordersFrom,
                  ordersTo: testmodel3.ordersTo,
                  conversionRateFrom: testmodel3.conversionRateFrom,
                  conversionRateTo: testmodel3.conversionRateTo,
                  match1: testmodel3.match1,
                  startDate: $scope.datePicker9.date.startDate,
                  endDate: $scope.datePicker9.date.endDate,
                })
                .then(function(response) {
                  $scope.duplicates = response;
                  $scope.showme4 = true;
                });
            }
          }
        };

        $scope.datePicker81 = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days')
          },
        };
        $scope.dateRangeOptions81 = {
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
              $rootScope.selectedCampaigns1 = $scope.selection1;
              $rootScope.selectedCampaigns2 = $scope.selection2;
              $rootScope.selectedACoS1 = 99999999;
              $scope.campaignName1 = $rootScope.selectedCampaigns1;
              $scope.acoszone1 = 99999999;

              $scope.saveacos = angular.element('#saveacos').val();
              $scope.saveacos1 = angular.element('#saveacos1').val();

              var testmodel1 = {};

              if (typeof $scope.model1.profitfrom === "undefined" || $scope.model1.profitfrom === null) testmodel1.profitfrom = -99999999;
              else testmodel1.profitfrom = $scope.model1.profitfrom;
              if (typeof $scope.model1.profitto === "undefined" || $scope.model1.profitto === null) testmodel1.profitto = 99999999;
              else testmodel1.profitto = $scope.model1.profitto;
              if (typeof $scope.model1.revenuefrom === "undefined" || $scope.model1.revenuefrom === null) testmodel1.revenuefrom = -99999999;
              else testmodel1.revenuefrom = $scope.model1.revenuefrom;
              if (typeof $scope.model1.revenueto === "undefined" || $scope.model1.revenueto === null) testmodel1.revenueto = 99999999;
              else testmodel1.revenueto = $scope.model1.revenueto;
              if (typeof $scope.model1.adspendfrom === "undefined" || $scope.model1.adspendfrom === null) testmodel1.adspendfrom = -99999999;
              else testmodel1.adspendfrom = $scope.model1.adspendfrom;
              if (typeof $scope.model1.adspendto === "undefined" || $scope.model1.adspendto === null) testmodel1.adspendto = 99999999;
              else testmodel1.adspendto = $scope.model1.adspendto;
              if (typeof $scope.model1.acosfrom === "undefined" || $scope.model1.acosfrom === null) testmodel1.acosfrom = -99999999;
              else testmodel1.acosfrom = $scope.model1.acosfrom;
              if (typeof $scope.model1.acosto === "undefined" || $scope.model1.acosto === null) testmodel1.acosto = 99999999;
              else testmodel1.acosto = $scope.model1.acosto;
              if (typeof $scope.model1.impressionsfrom === "undefined" || $scope.model1.impressionsfrom === null) testmodel1.impressionsfrom = -99999999;
              else testmodel1.impressionsfrom = $scope.model1.impressionsfrom;
              if (typeof $scope.model1.impressionsto === "undefined" || $scope.model1.impressionsto === null) testmodel1.impressionsto = 99999999;
              else testmodel1.impressionsto = $scope.model1.impressionsto;
              if (typeof $scope.model1.clicksfrom === "undefined" || $scope.model1.clicksfrom === null) testmodel1.clicksfrom = -99999999;
              else testmodel1.clicksfrom = $scope.model1.clicksfrom;
              if (typeof $scope.model1.clicksto === "undefined" || $scope.model1.clicksto === null) testmodel1.clicksto = 99999999;
              else testmodel1.clicksto = $scope.model1.clicksto;
              if (typeof $scope.model1.ctrfrom === "undefined" || $scope.model1.ctrfrom === null) testmodel1.ctrfrom = -99999999;
              else testmodel1.ctrfrom = $scope.model1.ctrfrom;
              if (typeof $scope.model1.ctrto === "undefined" || $scope.model1.ctrto === null) testmodel1.ctrto = 99999999;
              else testmodel1.ctrto = $scope.model1.ctrto;
              if (typeof $scope.model1.avecpcfrom === "undefined" || $scope.model1.avecpcfrom === null) testmodel1.avecpcfrom = -99999999;
              else testmodel1.avecpcfrom = $scope.model1.avecpcfrom;
              if (typeof $scope.model1.avecpcto === "undefined" || $scope.model1.avecpcto === null) testmodel1.avecpcto = 99999999;
              else testmodel1.avecpcto = $scope.model1.avecpcto;
              if (typeof $scope.model1.ordersFrom === "undefined" || $scope.model1.ordersFrom === null || $scope.model1.ordersFrom === '') testmodel1.ordersFrom = -99999999;
              else testmodel1.ordersFrom = $scope.model1.ordersFrom;
              if (typeof $scope.model1.ordersTo === "undefined" || $scope.model1.ordersTo === null || $scope.model1.ordersTo === '') testmodel1.ordersTo = 99999999;
              else testmodel1.ordersTo = $scope.model1.ordersTo;
              if (typeof $scope.model1.conversionRateFrom === "undefined" || $scope.model1.conversionRateFrom === null || $scope.model1.conversionRateFrom === '') testmodel1.conversionRateFrom = -99999999;
              else testmodel1.conversionRateFrom = $scope.model1.conversionRateFrom;
              if (typeof $scope.model1.conversionRateTo === "undefined" || $scope.model1.conversionRateTo === null || $scope.model1.conversionRateTo === '') testmodel1.conversionRateTo = 99999999;
              else testmodel1.conversionRateTo = $scope.model1.conversionRateTo;
              if (typeof $scope.model1.match1 === "undefined" || $scope.model1.match1 === null) testmodel1.match1 = 'ANY';
              else testmodel1.match1 = $scope.model1.match1;

              CampaignModel.searchbyACoSmult1({
                  user: $scope.user.id,
                  acosfrom1: $scope.saveacos1,
                  acostill: 0,
                  campaign: $rootScope.selectedCampaigns2,
                  SKU: $scope.selection1,
                  profitfrom: testmodel1.profitfrom,
                  profitto: testmodel1.profitto,
                  revenuefrom: testmodel1.revenuefrom,
                  revenueto: testmodel1.revenueto,
                  adspendfrom: testmodel1.adspendfrom,
                  adspendto: testmodel1.adspendto,
                  acosfrom: testmodel1.acosfrom,
                  acosto: testmodel1.acosto,
                  impressionsfrom: testmodel1.impressionsfrom,
                  impressionsto: testmodel1.impressionsto,
                  clicksfrom: testmodel1.clicksfrom,
                  clicksto: testmodel1.clicksto,
                  ctrfrom: testmodel1.ctrfrom,
                  ctrto: testmodel1.ctrto,
                  avecpcfrom: testmodel1.avecpcfrom,
                  avecpcto: testmodel1.avecpcto,
                  ordersFrom: testmodel1.ordersFrom,
                  ordersTo: testmodel1.ordersTo,
                  conversionRateFrom: testmodel1.conversionRateFrom,
                  conversionRateTo: testmodel1.conversionRateTo,
                  match1: testmodel1.match1,
                  startDate: $scope.datePicker81.date.startDate,
                  endDate: $scope.datePicker81.date.endDate
                })
                .then(function(response) {
                  $scope.searchterms1 = response;
                });
            }
          }
        };

        $rootScope.copyall2 = function() {
          $scope.copiedkeywords1 = '';
          $scope.copiedkeywordsmatrix1 = [];

          for (var i = 0; i <= $scope.duplicates.length - 1; i++) {
            $scope.copiedkeywordsmatrix1.push($scope.duplicates[i].Keyword);
          }

          $scope.copiedkeywords1 = $scope.copiedkeywordsmatrix1.toString().replace(/,/g, '\n');
        };

        $scope.datePicker8 = {
          date: {
            startDate: moment().subtract(37, 'days'),
            endDate: moment().subtract(7, 'days')
          },
        };

        // Date range picker on search term expansion page.
        $scope.dateRangeOptionsForSearchKeywordFilter = {
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
              // FIXME: Why do we call this function?
              // $scope.removeKeywords();

              $scope.saveacos = angular.element('#saveacos').val();
              $scope.saveacos1 = angular.element('#saveacos1').val();
              $scope.showme1 = true;
              $scope.showme2 = true;
              $rootScope.selectedCampaigns1 = $scope.selection1;
              $rootScope.selectedCampaigns2 = $scope.selection2;
              $rootScope.selectedACoS1 = $scope.saveacos1;

              $rootScope.acoszone = angular.element('#saveacos').val();
              $rootScope.acoszone1 = angular.element('#saveacos1').val();
              $rootScope.saveacos = angular.element('#saveacos').val();

              $rootScope.saveacos1 = angular.element('#saveacos1').val();

              $scope.campaignName1 = $rootScope.selectedCampaigns1;
              $scope.acoszone1 = $rootScope.selectedACoS1;

              var filterOptions = {
                user: $scope.user.id,
                acosfrom1: $scope.saveacos,
                acostill: 0,
                campaign: $scope.selection6,
                SKU: $scope.selection1,
                startDate: $scope.datePicker8.date.startDate,
                endDate: $scope.datePicker8.date.endDate,
              };

              var filterKeys = [
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
              filterKeys.forEach(function (key) {
                if (typeof $scope.model1[key] !== "undefined" && $scope.model1[key] !== null && $scope.model1[key] !== '') {
                  filterOptions[key] = $scope.model1[key];
                }
              });

              // FIXME: Still not so clear what to use among the below two functions.
              //CampaignModel.searchbyACoSmult1(filterOptions)
              CampaignModel.searchbyACoSmult(filterOptions)
                .then(function (response) {
                  $scope.searchterms = response;
                });
            }
          }
        };

        $scope.copiedkeywords1 = '';
        $scope.copiedkeywordsmatrix1 = [];
        $scope.copyall1 = function() {
          $scope.copiedkeywords1 = '';
          $scope.copiedkeywordsmatrix1 = [];

          for (var i = 0; i <= $scope.checkFeature.selected.searchterm.length - 1; i++) {
            $scope.copiedkeywordsmatrix1.push($scope.checkFeature.selected.searchterm[i].Keyword);
          }
          //This is for Match Type page
          $rootScope.copiedkeywords = $scope.copiedkeywordsmatrix1;
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

        $scope.setacos1 = function() {
          CampaignModel.searchbyACoS1({
              user: $scope.user.id,
              acosfrom: $scope.acoszone1,
              acostill: 0,
              campaign: $stateParams.campaign1,
              startDate: null,
              endDate: null
            })
            .then(function(response) {
              $scope.searchterms1 = response;
            });
        };

        $scope.continueWithAcos = function() {
          $rootScope.matchTypeFlag = true;

          if ($scope.selection2.length < 1) {
            MessageService.success('Please select some campaigns.');
            return;
          }

          $scope.saveacos = angular.element('#saveacos').val();
          $scope.saveacos1 = angular.element('#saveacos1').val();

          $scope.showme1 = true;
          $scope.showme2 = true;
          $rootScope.selectedCampaigns1 = $scope.selection1;
          $rootScope.selectedCampaigns2 = $scope.selection2;
          $rootScope.selectedACoS1 = $scope.saveacos1;
          $rootScope.acoszone1 = angular.element('#saveacos1').val();
          $rootScope.saveacos1 = angular.element('#saveacos1').val();

          $scope.campaignName1 = $rootScope.selectedCampaigns1;
          $scope.acoszone1 = $rootScope.selectedACoS1;

          var filterOptions = {
            user: $scope.user.id,
            acosfrom1: $scope.saveacos1,
            acostill: 0,
            campaign: $rootScope.selectedCampaigns2,
            SKU: $scope.selection1,
            startDate: null,
            endDate: null,
          };

          var filterKeys = [
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
          filterKeys.forEach(function (key) {
            if (typeof $scope.model1[key] !== "undefined" && $scope.model1[key] !== null && $scope.model1[key] !== '') {
              filterOptions[key] = $scope.model1[key];
            }
          });

          CampaignModel.searchbyACoSmult1(filterOptions)
            .then(function(response) {
              $scope.searchterms1 = response;
              updateCopy($scope.searchterms1, '3');
            });
        };

        $scope.generator = {};

        $scope.generate = function() {
          $scope.generator.generated = $scope.datePicker3.date.startDate.toISOString().slice(0, 10) + "-" + $scope.datePicker3.date.endDate.toISOString().slice(0, 10) + ' ' + $scope.generator.acos + '% ACoS ' + $scope.generator.name;
        };

        $scope.removeKeywords = function() {
          $scope.saveacos = angular.element('#saveacos').val();
          $scope.saveacos1 = angular.element('#saveacos1').val();
          $scope.newmode = 1;
          var tmpAcosfrom = 0;
          var tmpAcosto = $scope.saveacos;
          if ($scope.newmodel.acosfrom > 0) {
            tmpAcosfrom = $scope.newmodel.acosfrom;
          }
          if ($scope.newmodel.acosto > 0) {
            tmpAcosto = $scope.newmodel.acosto;
          }
          CampaignModel.removekeywords({
              user: $scope.user.id,
              acosfrom: tmpAcosfrom,
              acostill: tmpAcosto,
              campaign: $scope.selection6,
              revenuefrom: $scope.newmodel.revenuefrom,
              revenueto: $scope.newmodel.revenueto,
              adspendfrom: $scope.newmodel.adspendfrom,
              adspendto: $scope.newmodel.adspendto,
              impressionsfrom: $scope.newmodel.impressionsfrom,
              impressionsto: $scope.newmodel.impressionsto,
              clicksfrom: $scope.newmodel.clicksfrom,
              clicksto: $scope.newmodel.clicksto,
              ctrfrom: $scope.newmodel.ctrfrom,
              ctrto: $scope.newmodel.ctrto,
              acosto: $scope.newmodel.acosto,
              avecpcfrom: $scope.newmodel.avecpcfrom,
              avecpcto: $scope.newmodel.avecpcto,
              ordersFrom: $scope.newmodel.ordersFrom,
              ordersTo: $scope.newmodel.ordersTo,
              conversionRateFrom: $scope.newmodel.conversionRateFrom,
              conversionRateTo: $scope.newmodel.conversionRateTo,
              match1: $scope.newmodel.match1,
              startDate: $scope.datePicker8.date.startDate,
              endDate: $scope.datePicker8.date.endDate
            })
            .then(function(response) {
              $scope.searchterms = response;
              $scope.showme40 = true;
            });
        };

        $scope.dtOptions = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [2, 'desc']
        ]);
        $scope.dtOptions2 = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [1, 'desc']
        ]);
        $scope.dtOptions3 = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('lengthMenu', [10, 25, 50, 75, 100]).withOption('iDisplayLength', 10);
        $scope.dtOptions7 = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('lengthMenu', [10, 25, 50, 75, 100]).withOption('iDisplayLength', 10);
        $scope.dtOptions4 = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400);
        $scope.dtOptions5 = DTOptionsBuilder.newOptions().withScroller()
          .withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [1, 'desc']
        ]);
        // Assign this to a variable
        var self = this;

        // Get our center id
        self.centerId = $stateParams.centerId;
      }
    ]);


  // Controller which contains all necessary logic for product list GUI on boilerplate application.
  angular.module('frontend.ppc.power')
    .controller('SinglePowerController', [
      '$rootScope', '$scope', '$state', '$stateParams', '$filter', 'SettingsModel', '$timeout',
      'UserService', 'CampaignModel', 'DTOptionsBuilder',
      function controller($rootScope, $scope, $state, $stateParams, $filter, SettingsModel, $timeout,
        UserService, CampaignModel, DTOptionsBuilder) {

        $scope.user = UserService.user();
        // Set current scope reference to models
        var load = SettingsModel.getvalues({
            user: $scope.user.id
          })
          .then(function(response) {

            $timeout(function() {
              $rootScope.initCurrentCurrency();
            });

            $rootScope.updateaccount = function(acc) {

              angular.forEach($scope.settingsall, function(member, index) {

                //Just add the index to your item
                if ((member.country_id + ' - ' + member.SellerID) === acc) {
                  $rootScope.setUser = member.user;
                }
                if ($state.is('ppc.home')) $state.reload();
                else $state.go('ppc.home');
              });
            };

            $scope.countries2 = [];
            $rootScope.accounts_list = [];

            if (response.length > 0) {
              $scope.settingsall = response;
              angular.forEach(response, function(member, index) {
                //Just add the index to your item
                member.index = index;

                $scope.countries2.push(member.country_id);
                $rootScope.accounts_list.push(member.country_id + ' - ' + member.SellerID);

                if (member.user == $scope.user.id) {
                  $scope.countries3 = member.country_id;
                  $rootScope.accounts_list_selected = member.country_id + ' - ' + member.SellerID;
                }
              });

              $("#country1").countrySelect("destroy");
              $("#country1").countrySelect({
                onlyCountries: $scope.countries2
              });
              $("#country1").countrySelect("selectCountry", $scope.countries3);
            }
          });

        $scope.campaignName = $rootScope.selectedCampaigns;
        $scope.acoszone = $rootScope.selectedACoS;

        CampaignModel.searchbyACoSmult({
            user: $scope.user.id,
            acosfrom: $rootScope.selectedACoS,
            acostill: 0,
            campaign: $rootScope.selectedCampaigns,
            startDate: $scope.datePicker8.date.startDate,
            endDate: $scope.datePicker8.date.endDate
          })
          .then(function(response) {
            $scope.searchterms = response;
          });

        $scope.copiedkeywords = '';
        $scope.copiedkeywordsmatrix = [];
        $scope.copyall = function() {
          $scope.copiedkeywords = '';
          $scope.copiedkeywordsmatrix = [];

          for (var i = 0; i <= $scope.searchterms.length - 1; i++) {
            $scope.copiedkeywordsmatrix.push($scope.searchterms[i].Search);
          }

          $scope.copiedkeywords = $scope.copiedkeywordsmatrix.toString().replace(/,/g, ',\n');
        };
        $scope.addsearch = function(keyword) {
          // search and remove the string.
          var found = false;

          for (var i = 0; i <= $scope.copiedkeywordsmatrix.length - 1; i++) {
            if ($scope.copiedkeywordsmatrix[i] === keyword) {
              $scope.copiedkeywordsmatrix.splice(i, 1);
              found = true;
            }
          }

          if (!found) {
            //if didnt found push it to the bottom
            $scope.copiedkeywordsmatrix.push(keyword)
          }

          //rebuild
          $scope.copiedkeywords = $scope.copiedkeywordsmatrix.toString().replace(/,/g, ',\n');
        };

        $scope.setacos = function() {
          var searchbyACoS = CampaignModel.searchbyACoS({
              user: $scope.user.id,
              acosfrom: 0,
              acosto: $scope.acoszone,
              campaign: $stateParams.campaign,
              startDate: $scope.datePicker8.date.startDate,
              endDate: $scope.datePicker8.date.endDate
            })
            .then(function(response) {
              $scope.searchterms = response;
            });
        };

        $scope.dtOptions = DTOptionsBuilder.newOptions().withScroller().withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [1, 'desc']
        ]);
        $scope.dtOptions1 = DTOptionsBuilder.newOptions().withScroller().withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [1, 'asc']
        ]);
        $scope.dtOptions10 = DTOptionsBuilder.newOptions().withScroller().withOption('scrollX', '100%').withOption('scrollY', 400).withOption('aaSorting', [
          [1, 'asc']
        ]);
      }
    ]);
}());
