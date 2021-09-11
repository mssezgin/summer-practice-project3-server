const express = require('express');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const bcrypt = require('bcryptjs');
const router = express.Router();

const userRoute = require('./user.route');
const Users = require('../models/Users');
const Logs = require('../models/Logs');


// http://localhost:4041/login


// post
router.post('/', async (req, res, next) => {

    // TODO: use correct credentials
    // TODO: allow username or email

    let logInfo = {
        when: Date.now(),
        action: "LOGIN",
        ip:  req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
        browser: req.headers["user-agent"]
    };

    try {

        const loginCreds = req.body;
        if (!(loginCreds.username && loginCreds.password)) {
            return res.status(400).send("Some required fields are missing.");
        }

        const user = await Users.findOne({username: loginCreds.username});

        if (user && (await bcrypt.compare(loginCreds.password, user.password))) {
            const token = jwt.sign(
                {
                    userId: user._id,
                    admin: user.admin
                },
                jwtConfig.key,
                {expiresIn: "2h"}
            );

            logInfo.success = true;
            logInfo.resultMessage = "OK";
            logInfo.actor = {
                userId: user._id,
                username: user.username,
                email: user.email
            };
            const logged = await Logs.create(logInfo);

            return res.status(200).json({
                token: token,
                user: user
            });
        }

        logInfo.success = false;
        logInfo.resultMessage = "Invalid credentials.";
        logInfo.actor = {
            username: loginCreds.username
        };
        const logged = await Logs.create(logInfo);

        return res.status(400).send(logInfo.resultMessage);

    } catch (e) {
        logInfo.success = false;
        logInfo.resultMessage = "ERROR: " + e;
        logInfo.actor = {
            username: req.body.username
        };
        const logged = await Logs.create(logInfo);
        console.error('Error in login:\n', e);
        next(e);
    }
});

module.exports = router;
