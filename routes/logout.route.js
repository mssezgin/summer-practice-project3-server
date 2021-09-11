const express = require('express');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const router = express.Router();
const auth = require('../middleware/auth');

const Users = require('../models/Users');
const Logs = require('../models/Logs');


// http://localhost:4041/logout


// get // TODO: for testing
router.get('/', auth, async (req, res, next) => {

    // TODO: req.body = { username: <username> }
    console.log('origin', req.headers['origin'],
        '\nreferrer', req.referrer,
        '\nremoteAddress', req.socket.remoteAddress,
        '\nip', req.ip,
        '\nx-forwarded-for', req.headers['x-forwarded-for']); // TODO: delete this

    let logInfo = {
        when: Date.now(),
        action: "LOGOUT",
        ip:  req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, // TODO: ?
        browser: req.headers["user-agent"]
    };

    try {
        console.log('Logout:', req.body); // TODO: delete this

        logInfo.success = true;
        logInfo.resultMessage = "OK";
        logInfo.actor = {
            userId: req.user.userId,
            username: req.user.userId || req.body.username || ""
            // email: req.body.email
        };
        const logged = await Logs.create(logInfo);
        console.log('Logged out');
        return res.status(200).send(logInfo.resultMessage);

    } catch (e) {
        logInfo.success = false;
        logInfo.resultMessage = "ERROR: " + e;
        logInfo.actor = {
            username: req.body.username
        };
        const logged = await Logs.create(logInfo);
        console.error('Error in logout:\n', e);
        next(e);
    }
});


// post
router.post('/', auth, async (req, res, next) => {

    // TODO: req.body = { username: <username> }
    console.log('origin', req.headers['origin'],
        '\nreferrer', req.referrer,
        '\nremoteAddress', req.socket.remoteAddress,
        '\nip', req.ip,
        '\nx-forwarded-for', req.headers['x-forwarded-for']); // TODO: delete this

    let logInfo = {
        when: Date.now(),
        action: "LOGOUT",
        ip:  req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip, // TODO: ?
        browser: req.headers["user-agent"]
    };

    try {
        console.log('Logout:', req.body); // TODO: delete this

        logInfo.success = true;
        logInfo.resultMessage = "OK";
        logInfo.actor = {
            userId: req.user.userId,
            username: req.user.userId || req.body.username || ""
            // email: req.body.email
        };
        const logged = await Logs.create(logInfo);

        return res.status(200).send(logInfo.resultMessage);

    } catch (e) {
        logInfo.success = false;
        logInfo.resultMessage = "ERROR: " + e;
        logInfo.actor = {
            username: req.body.username
        };
        const logged = await Logs.create(logInfo);
        console.error('Error in logout:\n', e);
        next(e);
    }
});

module.exports = router;
