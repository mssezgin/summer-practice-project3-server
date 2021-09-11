const express = require('express');
const router = express.Router();

const auth = require("../middleware/auth");
const usersRoute = require('./admin_routes/users.route');
const messagesRoute = require('./admin_routes/messages.route');
const logsRoute = require('./admin_routes/logs.route');


// http://localhost:4041/admin


// authenticate admin
router.use(auth, (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        return res.status(403).send('Personel harici giremez!');
    }
});

// admin homepage
router.get('/', (req, res, next) => {
    res.send('<h1>This is admin homepage.</h1>');
});

// admin routes
router.use('/users', usersRoute);
router.use('/messages', messagesRoute);
router.use('/logs', logsRoute);

module.exports = router;
