'use strict';

var _ = require('lodash');
var postmark = require('postmark');
var bcrypt = require('bcryptjs');
var async = require('async');

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    sendmail: function sendmail(request, response) {
        var client = new postmark.Client("8bf97df7-26e6-4cdd-ac31-ff6377c15993");
        var email = request.param('email');
        var url = request.param('url');
        var dtime = Date.now();

        var hash = bcrypt.hashSync(email + dtime);
        var query1 = 'select count(user.email) as cnt from user where email="' + email + '"';
        var query2 = 'select count(forgot.email) as cnt from forgot where email="' + email + '"';

        sails.models['forgot'].query(query2, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            if (results[0].cnt >= 1) {
                sails.models['forgot'].update({
                    email: email
                }, {
                    hashkey: hash,
                    dtime: dtime
                });
                sails.models['forgot'].query("update forgot set hashkey='" + hash + "', dtime='" + dtime + "' where email='" + email + "'", function(err, results) {
                    if (err) {
                        return err;
                    }
                });
            } else {
                sails.models['forgot'].query("insert into forgot set email='" + email + "', hashkey='" + hash + "',dtime='" + dtime + "'", function(err, results) {
                    if (err) {
                        return err;
                    }
                });
            }
        });

        sails.models['user'].query(query1, function(err, results) {
            if (err) {
                return response.serverError(err);
            }
            if (results[0].cnt >= 1) {
                client.sendEmail({
                    "From": "admin@ppcentourage.com",
                    "To": email,
                    "Subject": "Please confirm your Email",
                    "TextBody": "Hi, there.\nTo change your password please click below \nhttps://www.ppcentourage.com/chgpwd?email=" + email + "&hash=" + hash + "\nThanks."
                });
                return response.send('ok');
            } else {
                return response.send('failed');
            }
        });
    },
    pchange: function pchange(request, response) {
        var oldpwd = request.param('oldpwd');
        var newpwd = request.param('newpwd');
        var user = request.param('user');
        sails.models['passport'].findOne({
            user: user.id
        }).exec(function callback(error, res) {
            if (error) {
                return response.send(error);
            } else if (!res) {
                return response.send('token');
            } else {
                bcrypt.compare(oldpwd, res.password, function(err1, res) {
                    if (res) {
                        sails.models['passport'].update({
                            user: user.id
                        }, {
                            password: newpwd
                        }).exec(function(err2, res2) {
                            return response.send('ok');
                        });
                    } else {
                        return response.send('notp');
                    }
                });
            }
        });
    },
    echange: function echange(request, response) {
        var curpwd = request.param('curpwd');
        var email = request.param('email');
        var user = request.param('user');
        sails.models['passport'].findOne({
            user: user.id
        }).exec(function callback(error, res) {
            if (error) {
                return response.send(error);
            } else if (!res) {
                return response.send('token');
            } else {
                bcrypt.compare(curpwd, res.password, function(err1, res) {
                    if (res) {
                        sails.models['user'].update({
                            id: user.id
                        }, {
                            email: email
                        }).exec(function(err2, res2) {
                            return response.send('ok');
                        });
                    } else {
                        return response.send('notp');
                    }
                });
            }
        });
    },
    chgpwd: function (request, response) {
            var email = request.param('email');
            var hash = request.param('hash');
            var pwd = request.param('pwd');

            sails.models['user'].find({
                email: email
            }).exec(function(err, users) {
                if (err) {
                    return response.send(err);
                }

                if (!users.length) {
                    return response.send('no email');
                }

                var userId = users[0].id;

                sails.models['forgot']
                  .query("SELECT * FROM forgot WHERE email='" + email + "' AND hashkey='" + hash + "'", function(err, forgots) {
                    if (err) {
                        return response.send('no email');
                    }

                    if (!forgots.length || (Date.now() - forgots[0].dtime) > 12999999) {
                        return response.send('request expired');
                    }

                    // TODO: Remove processed entry from 'forgot' table.

                    sails.models['passport']
                        .update({
                            user: userId,
                        }, {
                            password: pwd
                        })
                        .exec(function (err) {
                            if (err) {
                                return response.send(err);
                            }
                            return response.send('ok');
                        });

                });
            });
        }
});
