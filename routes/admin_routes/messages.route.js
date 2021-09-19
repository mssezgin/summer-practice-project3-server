const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// model
let Users = require('../../models/Users');
let Messages = require('../../models/Messages');


// http://localhost:4041/admin/messages


// get
router.get('/', async (req, res, next) => {

    try {
        // TODO: add filters
        const sort = req.query.sort || '_id';
        let query = Messages.find().sort(sort);
        const totalSize = await Messages.countDocuments();
        const pageSize = 10;
        const totalPages = Math.ceil(totalSize / pageSize);
        let page = parseInt(req.query.page, 10);
        if (page && page > 0) {
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
                    pageSize: result.length,
                    page: page,
                    result: result
                });
            }
        });

    } catch (e) {
        console.log(e);
        next(e);
    }
});

router.get('/:messageId', (req, res, next) => {
    Messages.findById(req.params.messageId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


// post // TODO: (was) only for testing
router.post('/', async (req, res, next) => {

    if (!(req.body.from && req.body.from.username && req.body.to && req.body.to.username)) {
        return res.status(400).send("Some required fields are missing.");
    }

    const fromUser = await Users.findOne({ username: req.body.from.username }, { _id: 1, username: 1 });
    const toUser = await Users.findOne({ username: req.body.to.username }, { _id: 1, username: 1 });
    if (!fromUser) {
        return res.status(400).send( "From does not exist.");
    } else if (!toUser) {
        return res.status(400).send( "To does not exist.");
    }

    const newMessage = new Messages({
        from: {
            userId: fromUser._id,
            username: fromUser.username,
            deletedThis: false
        },
        to: {
            userId: toUser._id,
            username: toUser.username,
            deletedThis: false
        },
        subject: req.body.subject || '',
        body: req.body.body || ''
    });
    newMessage.save((error) => {
        if (error) {
            return next(error)
        } else {
            res.json(newMessage);
        }
    });
});


// put
router.put('/:messageId', async (req, res, next) => {

    let update = {
        updatedAt: Date.now()
    };

    if (req.body.seen) update.seen = req.body.seen;
    if (req.body.from) {
        if (req.body.from.username) {
            const fromUser = await Users.findOne({ username: req.body.from.username }, { _id: 1, username: 1 });
            if (!fromUser) {
                return res.status(400).send( "From does not exist.");
            }
            update["from.userId"] = fromUser._id;
            update["from.username"] = fromUser.username;
        }
        if (req.body.from.deletedThis) update["from.deletedThis"] = req.body.from.deletedThis;
    }
    if (req.body.to) {
        if (req.body.to.username) {
            const toUser = await Users.findOne({ username: req.body.to.username }, { _id: 1, username: 1 });
            if (!toUser) {
                return res.status(400).send( "To does not exist.");
            }
            update["to.userId"] = toUser._id;
            update["to.username"] = req.body.to.username;
        }
        if (req.body.to.deletedThis) update["to.deletedThis"] = req.body.to.deletedThis;
    }
    if (req.body.subject) update.subject = req.body.subject;
    if (req.body.body) update.body = req.body.body;

    Messages.findByIdAndUpdate(
        req.params.messageId,
        update,
        { new: true, runValidators: true },
        (error, result) => {
            if (error) {
                return next(error);
            } else {
                res.json(result);
            }
        }
    );
});


// delete
router.delete('/:messageId', (req, res, next) => {
    Messages.findByIdAndRemove(req.params.messageId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


module.exports = router;
