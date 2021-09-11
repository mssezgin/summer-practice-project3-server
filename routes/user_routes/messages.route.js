const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');

// model
let Users = require('../../models/Users');
let Messages = require('../../models/Messages');


// http://localhost:4041/user/messages


async function getInboxOrSent(req, res, next, list = 'inbox') {

    try {
        // TODO: improve sort and add filters
        const sort = req.query.sort || '-_id';
        let query;
        let totalSize;
        if (list === 'inbox') {

            query = Messages.find(
                {
                    "to.userId": req.user._id,
                    "to.deletedThis": false
                }, {
                    when: 1,
                    seen: 1,
                    from: 1,
                    subject: 1
                }
            ).sort(sort);
            totalSize = await Messages.countDocuments({
                "to.userId": req.user._id,
                "to.deletedThis": false
            });

        } else if (list === 'sent') {

            query = Messages.find(
                {
                    "from.userId": req.user._id,
                    "from.deletedThis": false
                }, {
                    when: 1,
                    seen: 1,
                    to: 1,
                    subject: 1
                }
            ).sort(sort);
            totalSize = await Messages.countDocuments({
                "from.userId": req.user._id,
                "from.deletedThis": false
            });

        } else {
            return next(404);
        }

        const pageSize = 10; // TODO: parseInt(req.query.pagesize, 10) || 10;
        const totalPages = Math.ceil(totalSize / pageSize);
        let page = parseInt(req.query.page, 10);
        if (page && page > 0 && totalPages > 0) {
            if (page >= totalPages) page = totalPages;
        } else {
            page = 1;
        }

        query.skip((page - 1) * pageSize).limit(pageSize).exec((error, result) => {
            if (error) {
                return next(error);
            } else {
                res.json({
                    totalSize: totalSize,
                    totalPages: totalPages,
                    pageSize: result.length || 0,
                    page: page,
                    result: result
                });
            }
        });

    } catch (e) {
        console.log(e);
        next(e);
    }
}


// get // TODO: redirect '/' to '/inbox'
router.get('/inbox', auth, (req, res, next) => {
    getInboxOrSent(req, res, next, 'inbox');
});

router.get('/sent', auth, (req, res, next) => {
    getInboxOrSent(req, res, next, 'sent');
});

// type ahead
router.get('/search', auth, async (req, res, next) => {

    try {

        if (!req.query.like) {
            return res.status(400).send('Parameter does not exist.');
        }

        let candidates = await Users.find(
            { username: { $regex: '.*' + req.query.like + '.*'}},
            { username: 1, _id: 0 }
        ).limit(5);

        res.json(candidates);

    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.get('/:messageId', auth, async (req, res, next) => {

    try {

        const message = await Messages.findById(req.params.messageId); // TODO: use projection (body)

        if (message && message.to.userId.toString() === req.user._id.toString() && !message.to.deletedThis) {
            if (message.seen) {
                return res.json(message);
            }
        } else if (message && message.from.userId.toString() === req.user._id.toString() && !message.from.deletedThis) {
            return res.json(message);
        } else { // TODO: use correct status code
            return res.status(404).send('Message not found.');
        }

        // TODO: use await (?)
        Messages.findByIdAndUpdate(
            req.params.messageId,
            {updatedAt: Date.now(), seen: true},
            {new: true, runValidators: true},
            (error, result) => {
                if (error) {
                    return next(error);
                } else {
                    return res.json(result); // TODO: use projection or previous result
                }
            }
        );

    } catch (e) {
        console.log(e);
        next(e);
    }
});


// post
router.post('/', auth, async (req, res, next) => {

    try {

        // TODO: check if from.username is valid
        const input = req.body;
        if (!(input.to && input.to.username)) {
            return res.status(400).send("Some required fields are missing.");
        }

        const toUser = await Users.findOne({username: input.to.username}, {_id: 1, username: 1});
        if (!toUser) {
            return res.status(404).send('User not found.');
        }

        const newMessage = new Messages({
            from: {
                userId: req.user._id,
                username: req.user.username,
                deletedThis: false
            },
            to: {
                userId: toUser._id,
                username: toUser.username,
                deletedThis: false
            },
            subject: input.subject,
            body: input.body
        });
        newMessage.save((error, result) => {
            if (error) {
                return next(error);
            } else {
                res.json(result);
            }
        });

    } catch (e) {
        console.log(e);
        next(e);
    }
});


// delete
router.delete('/:messageId', auth, async (req, res, next) => {

    try {

        const message = await Messages.findById(req.params.messageId);
        let canBeDeleted = false;

        if (message && message.from.userId.toString() === req.user._id.toString() && !message.from.deletedThis) {
            if (message.to.deletedThis) {
                canBeDeleted = true;
            } else {
                Messages.findByIdAndUpdate(
                    req.params.messageId,
                    {updatedAt: Date.now(), "from.deletedThis": true},
                    {new: true, runValidators: true},
                    (error) => {
                        if (error) {
                            return next(error);
                        } else {
                            return res.status(200).send('Message was deleted.');
                        }
                    }
                );
            }
        } else if (message && message.to.userId.toString() === req.user._id.toString() && !message.to.deletedThis) {
            if (message.from.deletedThis) {
                canBeDeleted = true;
            } else {
                Messages.findByIdAndUpdate(
                    req.params.messageId,
                    {updatedAt: Date.now(), "to.deletedThis": true},
                    {new: true, runValidators: true},
                    (error) => {
                        if (error) {
                            return next(error);
                        } else {
                            return res.status(200).send('Message was deleted.');
                        }
                    }
                );
            }
        } else {
            return res.status(404).send('Message not found.');
        }

        if (canBeDeleted) {
            Messages.findByIdAndRemove(req.params.messageId, (error) => {
                if (error) {
                    return next(error);
                } else {
                    return res.status(200).send('Message was deleted.');
                }
            });
        }

    } catch (e) {
        next(e);
    }
});


module.exports = router;
