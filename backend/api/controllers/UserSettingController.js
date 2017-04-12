'use strict';
var fs = require('fs');
var atob = require('atob');

var iconv = require('iconv-lite');

var _ = require('lodash');
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    loaduser: function(request, response) {
        sails.models['usersetting'].find({
            where: {
                user_id: request.param('user_id')
            }
        }).exec(function(err, result) {
            if (err) {
                return response.serverError(err);
            }
            response.send(result);
        });
    },
    findOneByType: function(request, response) {
        var user_id = request.param('user_id');
        var category = request.param('category');
        var type = request.param('type');

        sails.models['UserSetting'].find({
            where: {
                user_id: user_id,
                category: category,
                type: type
            }
        }).exec(function(err, result) {
            if (err) {
                return response.serverError(err);
            }
            response.send(result);
        });
    },
    findOne: function(request, response) {
        var id = request.param('id');
        sails.models['UserSetting'].findOne(id)
            .exec(function(err, result) {
                if (err) {
                    return response.serverError(err);
                }
                response.send(result);
            });
    },
    create: function(request, response) {
        var createdDate = new Date(request.param('createdAt'));
        var item = {
            user_id: request.param('user_id'),
            category: request.param('category'),
            type: request.param('type'),
            value: request.param('value')
        };
        sails.models['usersetting'].create(item)
            .exec(function(err, result) {
                if (err) {
                    return response.serverError(err);
                }
                response.send(result);
            })
    },
    update: function(request, response) {
        var item = {
            user_id: request.param('user_id'),
            category: request.param('category'),
            type: request.param('type'),
            value: request.param('value')
        };
        sails.models['usersetting'].update({
                user_id: item.user_id,
                category: item.category,
                type: item.type
            }, {
                value: item.value
            })
            .exec(function(err, result) {
                if (err) {
                    return response.serverError(err);
                }
                response.send(result);
            });
    },
    destroy: function(request, response) {
        var id = request.param('id');
        sails.models['UserSetting'].destroy({
                id: id
            })
            .exec(function(err, result) {
                if (err) {
                    return response.serverError(err);
                }
                response.send(result);
            });
    }
});
