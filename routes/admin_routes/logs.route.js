const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// model
let Logs = require('../../models/Logs');


// http://localhost:4041/admin/logs


// get
router.get('/', async (req, res, next) => {

    try {
        // TODO: add filters
        const sort = req.query.sort || '-_id';
        let query = Logs.find().sort(sort);
        const totalSize = await Logs.countDocuments();
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

router.get('/:logId', (req, res, next) => {
    Logs.findById(req.params.logId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


// post // TODO: only for testing
router.post('/', (req, res, next) => {

    const newLog = new Logs({
        action: req.body.action,
        success: req.body.success,
        resultMessage: req.body.resultMessage,
        actor: {
            userId: mongoose.Types.ObjectId(req.body.actor.userId),
            username: req.body.actor.username,
            email: req.body.actor.email
        },
        ip: req.body.ip,
        browser: req.body.browser
    });
    newLog.save((error) => {
        if (error) {
            return next(error)
        } else {
            res.json(newLog); // TODO
        }
    });
});


// put // TODO: only for testing, not complete
router.put('/:logId', (req, res, next) => {
    Logs.findByIdAndUpdate(req.params.logId, req.body, {new: true, runValidators: true}, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


// delete
router.delete('/:logId', (req, res, next) => {
    Logs.findByIdAndRemove(req.params.logId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


module.exports = router;
