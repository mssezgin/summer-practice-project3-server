const express = require('express');
const router = express.Router();

const messagesRoute = require('./user_routes/messages.route');


// http://localhost:4041/user


// user homepage
router.get('/', (req, res, next) => {
    res.send('<h1>This is user homepage.</h1>');
});

// user routes
// TODO: use('/me', meRoute);
router.use('/messages', messagesRoute);

module.exports = router;
