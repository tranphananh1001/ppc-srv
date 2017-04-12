(function () {
  'use strict';
  angular.module('frontend.ppc.campaign')
  .controller('CampaignLogController', [
    '$scope', '$rootScope', '$state', '$stateParams', 'MessageService','HomeModel',
    'ListConfig', 'SocketHelperService', 'SettingsModel',
    'UserService', 'CampaignLogModel', '$timeout',

    function controller($scope, $rootScope, $state, $stateParams, MessageService,HomeModel,
              ListConfig, SocketHelperService, SettingsModel,
              UserService, CampaignLogModel, $timeout) {

      $scope.chkTracks = [];
      $scope.date = new Date();

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };
      $scope.format = 'yyyy-MM-dd';

      $scope.dt = moment().format('YYYY-MM-DD');
      $scope.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1
      };
      $scope.minDate = $scope.minDate ? null : new Date();

      $scope.init = function () {
        $scope.campaignId = $scope.$parent.campaignId;

        $scope.showCount = 10;
        $scope.campaignLogs = [];

        $scope.item = {
          campaign_id: $scope.campaignId,
          type: 'USER',
          contents: '',
          state: 0,
          user: $scope.$parent.user.id,
        };

        $scope.load();
      };

      $scope.load = function () {
        CampaignLogModel.load({
          campaign_id: $scope.campaignId,
          user: $scope.$parent.user.id
        }).then(function (result) {
          for (var i = 0; i < result.length; i++) {
            result[i].state = parseInt(result[i].state) === 1 ? true : false;
          }
          $scope.campaignLogs = result;
          $rootScope.$emit("chart_start", {});
        });
      };

      $scope.addLog = function (isTracking) {
        $scope.item.createdAt = $scope.dt;
        $scope.item.state = isTracking === true ? '1' : '0';

        CampaignLogModel.create($scope.item)
        .then(function (result) {
          $scope.load();
          if (isTracking === true) {
            $rootScope.$emit('chart_start', {});
          }
          $scope.item.contents = '';
          $scope.item.state = 0;
        });
      };

      $scope.showMore = function () {
        $scope.showCount += 10;
        if ($scope.showCount > $scope.campaignLogs.length) {
          $scope.showCount = $scope.campaignLogs.length;
        }
      };

      $scope.showLess = function () {
        $scope.showCount = 10;
      };

      $scope.chkSelect = function(state, id) {
        $scope.chkTracks[0] = {};
        $scope.chkTracks[0].state = false;
        $scope.chkTracks[0].id = 0;
        $scope.chkTracks[id] = {};
        $scope.chkTracks[id].state = state;
        $scope.chkTracks[id].id = id;
      };

      $scope.delLog = function() {
        var chkLogs = [];
        for(var i=0;i<$scope.campaignLogs.length;i++){
          if($scope.campaignLogs[i].state)
            chkLogs.push($scope.campaignLogs[i].id)
        }
        CampaignLogModel.delLog({logs: chkLogs})
        .then(function(result){
          if(result=='ok'){
            MessageService.success('Selected logs has been deleted');
            $scope.load();
          }
        });
      };
      $scope.chgTrack = function() {
        CampaignLogModel.track({tracks: $scope.chkTracks})
        .then(function (result){
          if(result=='ok'){
            MessageService.success('Track Campaign Updated.');
            $rootScope.$emit("chart_start", {});
          }
        });
      };
      $scope.logResult = function(log_id, state) {
        if(!state){
          $scope.logdetail = false;
          return;
        }
        $scope.logdetail = true;
        CampaignLogModel.result({log_id: log_id, user_id:$scope.$parent.user.id, campaign_name:$scope.$parent.campaignName, type:'A'})
        .then(function (result){
          $scope.KPI = result[0];
          $scope.uprevenuea = $scope.KPI.Revenue;
          $scope.upcosta = $scope.KPI.Cost;
          $scope.upordersa = $scope.KPI.Orders;
          $scope.upacosa = $scope.KPI.Cost / $scope.KPI.Revenue * 100;
          $scope.upcpca = $scope.KPI.Cost / $scope.KPI.Clicks;
          $scope.upimpressionsa = $scope.KPI.Impressions;
          $scope.upctra = $scope.KPI.Clicks / $scope.KPI.Impressions * 100;
          $scope.upclicksa = $scope.KPI.Clicks;
          $scope.upcra = $scope.KPI.Orders / $scope.KPI.Clicks * 100;
          $scope.upprofita = $scope.KPI.Profit;
        });
        CampaignLogModel.result({log_id: log_id, user_id:$scope.$parent.user.id, campaign_name:$scope.$parent.campaignName, type:'B'})
        .then(function (result){
          $scope.KPI = result[0];
          $scope.uprevenueb = $scope.KPI.Revenue;
          $scope.upcostb = $scope.KPI.Cost;
          $scope.upordersb = $scope.KPI.Orders;
          $scope.upacosb = $scope.KPI.Cost / $scope.KPI.Revenue * 100;
          $scope.upcpcb = $scope.KPI.Cost / $scope.KPI.Clicks;
          $scope.upimpressionsb = $scope.KPI.Impressions;
          $scope.upctrb = $scope.KPI.Clicks / $scope.KPI.Impressions * 100;
          $scope.upclicksb = $scope.KPI.Clicks;
          $scope.upcrb = $scope.KPI.Orders / $scope.KPI.Clicks * 100;
          $scope.upprofitb = $scope.KPI.Profit;
        });
      };
      $scope.init();
  }]);
}());
