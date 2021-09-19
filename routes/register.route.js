const express = require('express');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const bcrypt = require('bcryptjs');
const router = express.Router();

const userRoute = require('./user.route');
const Users = require('../models/Users');
const Logs = require('../models/Logs');


// http://localhost:4041/register


// post
router.post('/', async (req, res, next) => {

    // TODO: use correct credentials
    // TODO: use 'or' while searching existing users

    let logInfo = {
        when: Date.now(),
        action: "REGISTER",
        ip:  req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip,
        browser: req.headers["user-agent"]
    };

    try {

        if (!(req.body.email && req.body.username && req.body.password)) {
            return res.status(400).send("Some required fields are missing.");
        }

        const oldUser1 = await Users.findOne({ username: req.body.username });
        const oldUser2 = await Users.findOne({ email: req.body.email });

        if (oldUser1 || oldUser2) {
            logInfo.success = false;
            logInfo.resultMessage = "User already exists.";
            logInfo.actor = {
                username: req.body.username,
                email: req.body.email
            };
            const logged = await Logs.create(logInfo);
            return res.status(409).send(logInfo.resultMessage);
        }

        let registerCreds = {
            admin: false
        };
        if (req.body.email && req.body.email.trim() !== '') registerCreds.email = req.body.email;
        if (req.body.username && req.body.username.trim() !== '') registerCreds.username = req.body.username;
        if (req.body.password && req.body.password.trim() !== '') registerCreds.password = await bcrypt.hash(req.body.password, 10);
        if (req.body.firstname && req.body.firstname.trim() !== '') registerCreds.firstname = req.body.firstname;
        if (req.body.lastname && req.body.lastname.trim() !== '') registerCreds.lastname = req.body.lastname;
        if (req.body.gender && req.body.gender.trim() !== '') registerCreds.gender = req.body.gender;
        if (req.body.birth && req.body.birth.trim() !== '') registerCreds.birth = req.body.birth;

        const newUser = await Users.create(registerCreds);

        const token = jwt.sign(
            {
                userId: newUser._id,
                admin: newUser.admin
            },
            jwtConfig.key,
            { expiresIn: "2h" }
        );

        logInfo.success = true;
        logInfo.resultMessage = "OK";
        logInfo.actor = {
            userId: newUser._id,
            username: newUser.username,
            email: newUser.email
        };
        const logged = await Logs.create(logInfo);

        return res.status(201).json({
            token: token,
            user: newUser
        });

    } catch (e) {
        logInfo.success = false;
        logInfo.resultMessage = "ERROR: " + e;
        logInfo.actor = {
            username: req.body.username,
            email: req.body.email
        };
        const logged = await Logs.create(logInfo);
        console.error('Error in register:\n', e);
        next(e);
    }
});

module.exports = router;
