'use strict';
var fs = require('fs');
var atob = require('atob');
var moment = require('moment');
var iconv = require('iconv-lite');
var async=require('async');

var _ = require('lodash');
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    find: function(request, response) {
        var sku = request.param('sku');
        var userId = request.param('user');

        sails.models['negatelog'].find({
          where: {
              sku: sku,
              createdUserId: userId
          },
          sort: 'created_at DESC'
        }).exec(function(err, result) {
            if (err) return response.serverError(err);
            response.send(result);
        });
    },
    findOne: function(request, response) {
        var id = request.param('id');

        sails.models['negatelog'].findOne(id)
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                response.send(result);
            });
    },
    delete: function(request, response) {
        var id = request.param('id');
        sails.models['negatelog'].destroy({
                id: id
            })
            .exec(function(err, result) {
                if (err) return response.send(err);
                else response.send('ok');
            });
    },
    bulkCreate: function (request, response) {
      var skus = request.param('skus'),
          userId = request.param('user'),
          keywordType = request.param('keywordType'),
          keywords = request.param('keywords');

      if (typeof skus == 'string') {
        var sku = skus;
        skus = [];
        skus.push(sku);
      }

      if (typeof keywords == 'string') {
        var keyword = keywords;
        keywords = [];
        keywords.push(keyword);
      }

      var arrLen = skus.length, i = 0;
      var errData=[];

      async.whilst(
        function(){
          return i<arrLen;
        },
        function(callback){
          var sku = skus[i];
          sails.models['negatelog'].findOne({
            sku: sku,
            createdUserId: userId,
            keywordType: keywordType
          }).exec(function(err, finn) {

            if (err) {
              errData.push(sku);
              callback(null,i++);
              return;
            }
            if (!finn) {
              var skuKeywords = keywords.join();
              sails.models['negatelog'].create({
                sku: sku,
                keywords: skuKeywords,
                keywordType: keywordType,
                createdUser : userId
              }).exec(function(err,data){
                if(err){
                  errData.push(sku);
                }
                callback(null,i++);
              });
            } else {
              var skuKeywords = finn.keywords.split(',');
              keywords.forEach(function (keyword) {
                if (skuKeywords.indexOf(keyword) < 0) {
                  skuKeywords.push(keyword);
                }
              })
              skuKeywords = skuKeywords.join();

              sails.models['negatelog'].update({
                sku: sku,
                createdUserId: userId,
                keywordType: keywordType
              },{
                keywords: skuKeywords
              }).exec(function(err,data){
                if(err){
                  console.log(err);
                  errData.push(sku);
                }
                callback(null,i++);
              });
            }
          });
        },
        function(err,n){
          if (errData.length > 0) {
            console.log(errData);//These are the data where error encountered!!!
          }
          response.ok(skus);
        }
      );
    },
    create: function(request, response) {
        var item = {
            sku: request.param('sku'),
            keyword: request.param('keyword'),
            keywordType: request.param('keywordType'),
            createdUserId : request.param('user')
        };
        console.log(item);
        sails.models['negatelog'].create(item)
            .exec(function(err, result) {
                console.log(result);
                if (err) return response.serverError(err);
                response.send(result);
            });
    },
    destroy: function(request, response) {
        var id = request.param('id');
        sails.models['negatelog'].destroy({
                id: id
            })
            .exec(function(err, result) {
                if (err) return response.serverError(err);
                response.send(result);
            });
    }
});
