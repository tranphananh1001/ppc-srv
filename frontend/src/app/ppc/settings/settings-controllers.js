/*jshint camelcase: false */
(function() {
  'use strict';

  angular.module('frontend.ppc.settings')
    .directive('ngConfirmClick', [
      function() {
        return {
          link: function(scope, element, attr) {
            var msg = attr.ngConfirmClick || 'Are you \n sure?';
            var clickAction = attr.confirmedClick;
            element.bind('click', function() {
              if (window.confirm(msg)) {
                scope.$eval(clickAction);
              }
            });
          }
        };
      }
    ])
    .controller('SettingsController', ['$scope', '$rootScope', 'UserService', '$state', '$stateParams', 'SettingsModel', 'ProductModel', '$http', '$timeout',
      'MessageService', 'CampaignPerfomanceReportModel',
      function($scope, $rootScope, UserService, $state, $stateParams, SettingsModel, ProductModel, $http, $timeout,
        MessageService, CampaignPerfomanceReportModel) {

        /* Variables */

        var temp_winner=false;

        $scope.settingsall = {
          firsttime: 999,
          productFetched : false
        };
        $rootScope.settingsall1 = [];

        $rootScope.reselected = 0;
        $scope.selectedSKU = [];

        // Set current scope reference to models
        $rootScope.country_code = '';
        $rootScope.countries2 = ['us', 'gb', 'de', 'ca', 'fr', 'cn', 'es', 'in', 'it', 'mx'];

        $scope.user = UserService.user();

        var self = this;
        self.centerId = $stateParams.centerId;

        /* Scope functions */

        $scope.filterProducts = function(max_sku) {
          return function(product) {
            return ((product.allowed > 0) || (max_sku === 0));
          };
        };

        $scope.checkChanged = function(item, user) {
          if (item.winner)  {
            $rootScope.checked[user]++;
          } else {
            $rootScope.checked[user]--;
          }
        };

        $scope.confirmRemove = function() {
          if (confirm('Are you sure you want to remove this account? All data for this account will be lost!\nPlease note: If you remove this account, you will be logged out automatically and you will have to log back in to see your other accounts.')) {
            $scope.delete_account($scope.settingsall);
          }
        };

        $scope.confirmGetToken = function() {
          if (confirm('First please logout of all Seller Cental accounts before getting token. \nClick OK to continue to GET TOKEN. \nMake sure you sign into the right Amazon seller account when getting token.')) {
            window.location.href = 'https://www.amazon.com/ap/oa?client_id=amzn1.application-oa2-client.f250e3787a2b4105bd5881a6d0f0e3a9&scope=cpc_advertising:campaign_management&response_type=code&redirect_uri=https://ppcentourage.com/amazon_callback';
          }
        };

        $scope.selectSKU = function(id) {
          if (id !== 0) {
            return;
          }
          for (var i in $scope.settingsall.products) {
            $scope.selectedSKU[$scope.settingsall.products[i].id] = $scope.selectedSKU[0];
          }
        };

        $scope.maxallowedSKUs = function() {
          //
        };

        $scope.setImageSm = function setImageSm($imageUrl) {
          return $imageUrl.replace('http://ecx.', 'https://images-na.ssl-');
        };

        $scope.delete_account = function(settings) {
          var user = settings.user;

          SettingsModel.delete_account({
            user: settings.user,
            subscription_id: settings.subscription_id
          })
          .then(function onSuccess() {
            MessageService.success('Account removed.');
            $state.reload();
          });
        };

        $scope.getSKUs = function(settings) {
          var user = settings.user;
          MessageService.success('PLEASE WAIT 12-24 HOURS FOR SKU’s TO APPEAR');
          SettingsModel.get_initial_skus({
            user: settings.user
          })
          .then(function onSuccess() {
            $state.reload();
          });
        };

        $scope.change_plan = function(settings) {
          SettingsModel.load_tariffs_old({
            plan_id: settings.plan_id
          })
          .then(function(response) {
            $timeout(function() {
              $scope.change_tariffs = response;
              $scope.change_plan_sel = 1;
              $scope.$apply();
            });
          });
        };

        $scope.update_subscription = function(settings) {
          SettingsModel.update_subscription({
            subscription_id: settings.subscription_id,
            new_plan: settings.plan_id
          })
          .then(function onSuccess() {
            $scope.change_plan_sel = 0;
            var user = settings.user;
            SettingsModel.maxallowedSKUs({
              user: user
            })
            .then( function (response) {
              $scope.settingsall.max_sku = response.max_sku;
              if (response.max_sku <= 0) {
                $state.reload();
                return;
              }
              $rootScope.limit = [];
              $rootScope.checked = [];

              $rootScope.limit[user] = response.max_sku;
              $rootScope.checked[user] = 0;

              SettingsModel.reselect({
                user: user
              })
              .then(function(response) {
                $rootScope.checked[user] = 0;
                $rootScope.products[user] = [];
                for (var i = 0; i < response.length; i++) {
                  if (response[i].allowed === undefined || response[i].allowed == 0) {
                    temp_winner=false;
                  } else {
                    temp_winner=true;
                  }
                  $rootScope.products[user].push({
                    id: response[i].id,
                    sku: response[i].sku,
                    asin: response[i].asin,
                    image_sm: response[i].image_sm,
                    "product-name": response[i]["product-name"],
                    allowed: response[i].allowed,
                    winner: temp_winner
                  });
                  if (response[i].allowed == 1) {
                    $rootScope.checked[user]++;
                  }
                  $rootScope.reselected = user;
                }
              });
            });
          });
        };

        $scope.reselect = function(settings) {
          var user = settings.user;
          SettingsModel.maxallowedSKUs({
            user: user
          })
          .then(function (response) {
            $rootScope.limit = [];
            $rootScope.checked = [];
            $rootScope.limit[user] = response.max_sku;
            $rootScope.checked[user] = 0;

            SettingsModel.reselect({
              user: user
            })
            .then(function(response) {
              $rootScope.checked[user] = 0;
              $rootScope.products[user] = [];

              for (var i = 0; i < response.length; i++) {
                if (response[i].allowed === undefined || response[i].allowed==0) {
                  temp_winner=false;
                } else {
                  temp_winner=true;
                }
                $rootScope.products[user].push({
                  id: response[i].id,
                  sku: response[i].sku,
                  asin: response[i].asin,
                  image_sm: response[i].image_sm,
                  "product-name": response[i]["product-name"],
                  allowed : response[i].allowed,
                  winner: temp_winner
                });
                $rootScope.reselected = user;
                if (response[i].allowed == 1) {
                  $rootScope.checked[user]++;
                }
              }
            });
          });
        };

        $scope.AddCountry = function() {
          if ($scope.settingsall.length == 0) {
            $scope.settingsall.push({
              subscription_id: $scope.user.chargebee_id,
              parent_id: $rootScope.parent_id,
              id: 0,
              user: 0,
              SellerID: '',
              MWSAuthToken: '',
              average_profit: '30',
              average_acos: '30',
              country_id: angular.element('#country2_code').val(),
              index: $scope.settingsall.length
            });

            $("#country2").countrySelect("destroy");
            $("#country2").countrySelect({
              onlyCountries: $rootScope.countries2
            });
            $("#country2").countrySelect("selectCountry", $rootScope.countries2[0]);
          } else {
            if (angular.element('#country2_code').val() == 'us') {
              SettingsModel.load_tariffs({
                parent_id: $rootScope.parent_id,
                country_code: angular.element('#country2_code').val()
              })
              .then(function(response) {
                $timeout(function() {
                  $scope.us_tariffs = response;
                  $scope.addnew = 1;
                  $scope.$apply();
                });
              });
            } else {
              $scope.addnew = 0;
            }
            $scope.innerH = 1;
          }
        };

        $scope.new_plan_signup = function(plan) {
          SettingsModel.add_new_plan({
            parent_id: $rootScope.parent_id,
            plan: plan,
            country_code: angular.element('#country2_code').val()
          })
          .then(function(response) {
            $scope.settingsall1.push({
              subscription_id: response.subscription,
              parent_id: $rootScope.parent_id,
              id: 0,
              user: response.user,
              SellerID: '',
              MWSAuthToken: '',
              average_profit: '30',
              average_acos: '30',
              country_id: angular.element('#country2_code').val(),
              index: $scope.settingsall1.length
            });
            $("#country2").countrySelect("destroy");
            $("#country2").countrySelect({
              onlyCountries: $rootScope.countries2
            });
            $("#country2").countrySelect("selectCountry", $rootScope.countries2[0]);

            $scope.innerH = 0;
            $rootScope.setUser = response.user;

            $state.reload();
          });
        };

        $scope.AddCountry_continue = function() {
        };

        $scope.SaveSellerAccount = function(settings, products) {
          $rootScope.reselect = 0;
          SettingsModel.addorreplace({
            parent_id: settings.parent_id,
            country_id: settings.country_id,
            user: settings.user,
            SellerID: settings.SellerID,
            MWSAuthToken: settings.MWSAuthToken,
            profit: settings.average_profit,
            acos: settings.average_acos,
            products: products,
            subscription: settings.subscription_id
          })
          .then( function (response) {
            MessageService.success('Updated.');
            $state.reload();
          });
        };

        $scope.uploadFile = function(files, id) {
          var fd = new FormData();
          fd.append("0", files[0]); // Append the file
          fd.append("user", id);

          $http.post('https://ppcentourage.com:1337/api/uploads/?user=' + id, fd, {
            withCredentials: true,
            headers: {
              'Content-Type': undefined
            },
            transformRequest: angular.identity
          }).success(function() {
            MessageService.success('Report uploaded, but it may takes up to 20 minutes for processing the data');
          }).error();
        };

        $scope.uploadFile1 = function(files, id) {
          var fd = new FormData();
          //Take the first selected file
          fd.append("0", files[0]);
          fd.append("user", id);

          $http.post('https://ppcentourage.com:1337/api/uploads1/?user=' + id, fd, {
            withCredentials: true,
            headers: {
              'Content-Type': undefined
            },
            transformRequest: angular.identity
          }).success(function() {
            MessageService.success('Report uploaded, but it may takes up to 20 minutes for processing the data');
          }).error();
        };

        $scope.AddSellerAccount = function() {
          SettingsModel.addorreplace({
            country_id: angular.element('#country_code').val(),
            user: $scope.user.id,
            SellerID: $scope.seller.SellerID,
            MWSAuthToken: $scope.seller.MWSAuthToken,
            profit: $scope.universal.profit,
            acos: $scope.universal.acos
          })
          .then( function onSuccess(response) {
            MessageService.success('Updated.');
          });
        };

        // Save our data
        $scope.save1 = function(resu) {
          MessageService.warning('Processing new report... Please don\'t close this window!');

          CampaignPerfomanceReportModel.create(resu)
          .then(function (response) {
            MessageService.success('Report uploaded successfully! ' + response.data.length + ' records imported.');
            delete $scope.controller.results;
            CampaignPerfomanceReportModel.count({
              where: {}
            })
            .then(function (response) {
              $scope.itemCount = response.count;
            });
          });
        };

        //Additional JQuery Listenrs

        $(document).on('change', '#country1', function() {
          angular.forEach($rootScope.settingsall1, function(member) {
            //Just add the index to your item
            if (member.country_id === angular.element('#country1_code').val()) {
              $rootScope.setUser = member.user;
            }

            if ($state.is('ppc.home')) {
              $state.reload();
            } else {
              $state.go('ppc.home');
            }
          });
        });

        $(document).on('change', '#country2', function() {
          if ($scope.settingsall.length === 0) {
            $scope.settingsall.push({
              subscription_id: $scope.user.chargebee_id,
              parent_id: $rootScope.parent_id,
              id: 0,
              user: 0,
              SellerID: '',
              MWSAuthToken: '',
              average_profit: '30',
              average_acos: '30',
              country_id: angular.element('#country2_code').val(),
              index: $scope.settingsall.length
            });

            $('#country2').countrySelect('destroy');
            $('#country2').countrySelect({
              onlyCountries: $rootScope.countries2
            });
            $('#country2').countrySelect('selectCountry', $rootScope.countries2[0]);
          } else {
            if (angular.element('#country2_code').val() === 'us') {
              $scope.addnew = 1;
            } else {
              $scope.addnew = 0;
            }
            $scope.innerH = 1;
          }
        });

        //Init Logic Actions

        if ($rootScope.setUser > 0) {
          $scope.user.id = $rootScope.setUser;
        }

        SettingsModel.getvalues({
          user: $scope.user.id
        })
        .then(function(response) {

          $timeout(function() {
            $rootScope.initCurrentCurrency();
          });

          //Function Re-definition
          $rootScope.updateaccount = function(acc) {
            angular.forEach($rootScope.settingsall1, function(member) {
              //Just add the index to your item
              if ((member.country_id + ' - ' + member.SellerID) === acc) {
                $rootScope.setUser = member.user;
              }

              if ($state.is('ppc.home')) {
                $state.reload();
              } else {
                $state.go('ppc.home');
              }
            });
          };

          //RE-SET VARIABLES;

          $rootScope.limit = [];
          $rootScope.checked = [];
          $rootScope.products = [];

          $scope.countries2 = [];
          $rootScope.accounts_list = [];

          $scope.settingsall = [];
          $scope.settingsall1 = [];

          if (response.length > 0) {
            $rootScope.settingsall1 = response;

            $rootScope.settingsall1.forEach(function(settings) {
              if (settings.user == $scope.user.id) {
                $scope.settingsall = settings;
                $scope.settingsall.productFetched = false;
                SettingsModel.getallowedskus({
                  user: settings.user
                })
                .then(function (response) {
                  settings.products = response;
                  $scope.settingsall.productFetched = true;
                  if (settings.MWSAuthToken && settings.MWSAuthToken.length > 5 && settings.SellerID && settings.SellerID.length > 5) {
                    settings.token = true;
                  } else {
                    settings.token = false;
                  }
                });
              }
            });

            angular.forEach(response, function(member, index) {
              //Just add the index to your item
              member.index = index;

              $scope.countries2.push(member.country_id);
              $rootScope.accounts_list.push(member.country_id + ' - ' + member.SellerID);

              if (member.user == $scope.user.id) {
                if (member.firsttime == 2) {
                  SettingsModel.maxallowedSKUs({
                    user: member.user
                  })
                  .then( function onSuccess(response2) {
                    $rootScope.limit[member.user] = response2.max_sku;
                    $rootScope.checked[member.user] = 0;

                    debugger;
                    ProductModel.getallSKUs({
                      user: member.user,
                      allowed: 0
                    })
                    .then(function(response3) {
                      debugger;
                      $rootScope.products[member.user] = [];

                      for (var i = 0; i < response3.length; i++) {
                        if (response3[i].allowed === undefined || response3[i].allowed==0) temp_winner=false; else  temp_winner=true;
                        $rootScope.products[member.user].push({
                          id: response3[i].id,
                          sku: response3[i].sku,
                          asin: response3[i].asin,
                          image_sm: response3[i].image_sm,
                          "product-name": response3[i]["product-name"],
                          allowed: response3[i].allowed,
                          winner: temp_winner
                        });
                      }
                    });
                  });
                }
                $scope.countries3 = member.country_id;
                $rootScope.accounts_list_selected = member.country_id + ' - ' + member.SellerID;
              }
            });

            $rootScope.parent_id = response[0].parent_id;
            $('#country2').countrySelect({
              onlyCountries: $rootScope.countries2
            });

            $('#country1').countrySelect('destroy');
            $('#country1').countrySelect({
              onlyCountries: $scope.countries2
            });
            $('#country1').countrySelect('selectCountry', $scope.countries3);

          } else {
            $('#country2').countrySelect({
              onlyCountries: $rootScope.countries2
            });
            $rootScope.parent_id = $scope.user.id;
          }
        });

        // Fetch data count
        CampaignPerfomanceReportModel.count({
          where: {
            user: $scope.user.id
          }
        })
        .then( function onSuccess(response) {
          $scope.itemCount = response.count;
        });
      }
    ])
    .directive('customOnChange', function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var onChangeHandler = scope.$eval(attrs.customOnChange);
          element.bind('change', onChangeHandler);
        }
      };
    })
    .directive('csvReader', [function() {
      // Function to convert to JSON
      var convertToJSON = function(content) {
        // Declare our variables
        var lines = content.csv.split('\r'),
          headers = lines[0].split(content.separator),
          results = [];

        if (headers[2] === 'Advertised SKU') {
          // For each row
          for (var i = 1; i < lines.length - 1; i++) {
            // Declare an object
            var obj = {};
            // Get our current line
            var line = lines[i].replace(/(\d+)\/(\d+)\/(\d+) 0:00/g, '$2/$1/$3').replace(/%/g, '').replace(/N\/A/g, '0').replace(/\n/g, '').split(new RegExp(content.separator + '(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
            // Populate our object
            obj = {
              'Campaign Name': line[0],
              'Ad Group Name': line[1],
              'Advertised SKU': line[2],
              'Keyword': line[3],
              'Match Type': line[4],
              'Start Date': line[5],
              'End Date': line[6],
              'Clicks': line[7],
              'Impressions': line[8],
              'CTR': line[9],
              'Total Spend': line[10],
              'Average CPC': line[11],
              'Currency': line[12],
              '1-day Orders Placed': line[13],
              '1-day Ordered Product Sales': line[14],
              '1-day Conversion Rate': line[15],
              '1-day Same SKU Units Ordered': line[16],
              '1-day Other SKU Units Ordered': line[17],
              '1-day Same SKU Units Ordered Product Sales': line[18],
              '1-day Other SKU Units Ordered Product Sales': line[19],
              '1-week Orders Placed': line[20],
              '1-week Ordered Product Sales': line[21],
              '1-week Conversion Rate': line[22],
              '1-week Same SKU Units Ordered': line[23],
              '1-week Other SKU Units Ordered': line[24],
              '1-week Same SKU Units Ordered Product Sales': line[25],
              '1-week Other SKU Units Ordered Product Sales': line[26],
              '1-month Orders Placed': line[27],
              '1-month Ordered Product Sales': line[28],
              '1-month Conversion Rate': line[29],
              '1-month Same SKU Units Ordered': line[30],
              '1-month Other SKU Units Ordered': line[31],
              '1-month Same SKU Units Ordered Product Sales': line[32],
              '1-month Other SKU Units Ordered Product Sales': line[33]
            };
            // Push our object to our result array
            results.push(obj);
          }
          // Return our array
          return results;
        }
      };

      return {
        restrict: 'A',
        scope: {
          results: '=',
          separator: '=',
          callback: '&saveResultsCallback'
        },
        link: function(scope, element, attrs) {
          // Create our data model
          var data = {
            csv: null,
            separator: scope.separator || '\t'
          };

          // When the file input changes
          element.on('change', function(e) {
            // Get our files
            var files = e.target.files;

            // If we have some files
            if (files && files.length) {
              // Create our fileReader and get our file
              var reader = new FileReader();
              var file = (e.srcElement || e.target).files[0];

              // Once the fileReader has loaded
              reader.onload = function(e) {

                // Get the contents of the reader
                var contents = e.target.result;

                // Set our contents to our data model
                data.csv = contents;

                // Apply to the scope
                scope.$apply(function() {

                  // Our data after it has been converted to JSON
                  scope.results = convertToJSON(data);

                  // Call our callback function
                  scope.callback(scope.result);
                });
              };

              // Read our file contents
              reader.readAsText(file);
            }
          });
        }
      };
    }]);
}());
