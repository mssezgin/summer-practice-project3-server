const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// model
let Users = require('../../models/Users');
let Messages = require('../../models/Messages');


// http://localhost:4041/admin/users


// get
router.get('/', async (req, res, next) => {

    try {
        // TODO: add filters
        const sort = req.query.sort || '_id';
        let query = Users.find().sort(sort);
        const totalSize = await Users.countDocuments();
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

router.get('/:userId', (req, res, next) => {
    Users.findById(req.params.userId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


// post
router.post('/', async (req, res, next) => {

    if (!(req.body.email && req.body.username && req.body.password)) {
        return res.status(400).send("Some required fields are missing.");
    }

    let newUserCreds = {
        admin: false
    };
    if (req.body.admin && req.body.admin !== '') newUserCreds.admin = req.body.admin;
    if (req.body.email && req.body.email !== '') newUserCreds.email = req.body.email;
    if (req.body.username && req.body.username !== '') newUserCreds.username = req.body.username;
    if (req.body.password && req.body.password !== '') newUserCreds.password = await bcrypt.hash(req.body.password, 10);
    if (req.body.firstname && req.body.firstname !== '') newUserCreds.firstname = req.body.firstname;
    if (req.body.lastname && req.body.lastname !== '') newUserCreds.lastname = req.body.lastname;
    if (req.body.gender && req.body.gender !== '') newUserCreds.gender = req.body.gender;
    if (req.body.birth && req.body.birth !== '') newUserCreds.birth = req.body.birth;

    const newUser = new Users(newUserCreds);
    newUser.save((error) => {
        if (error) {
            return next(error);
        } else {
            res.json(newUser);
        }
    });
});


// put
router.put('/:userId', async (req, res, next) => {

    let update = {
        updatedAt: Date.now()
    };

    if (req.body.admin && req.body.admin !== '') update.admin = req.body.admin;
    if (req.body.email && req.body.email !== '') update.email = req.body.email;
    if (req.body.username && req.body.username !== '') update.username = req.body.username;
    if (req.body.password && req.body.password !== '') update.password = await bcrypt.hash(req.body.password, 10);
    if (req.body.firstname && req.body.firstname !== '') update.firstname = req.body.firstname;
    if (req.body.lastname && req.body.lastname !== '') update.lastname = req.body.lastname;
    if (req.body.gender && req.body.gender !== '') update.gender = req.body.gender;
    if (req.body.birth && req.body.birth !== '') update.birth = req.body.birth;

    Users.findByIdAndUpdate(
        req.params.userId,
        update,
        {new: true, runValidators: true},
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
router.delete('/:userId', (req, res, next) => {

    Messages.deleteMany(
        {"from.userId": mongoose.Types.ObjectId(req.params.userId), "to.deletedThis": true},
        (error) => {
            if (error) {
                console.log('Could not deleteMany(from.userId)');
            }
        }
    );
    Messages.deleteMany(
        {"to.userId": mongoose.Types.ObjectId(req.params.userId), "from.deletedThis": true},
        (error) => {
            if (error) {
                console.log('Could not deleteMany(to.userId)');
            }
        }
    );
    Messages.updateMany(
        {"from.userId": mongoose.Types.ObjectId(req.params.userId), "to.deletedThis": false},
        {updatedAt: Date.now(), "from.deletedThis": true},
        (error) => {
            if (error) {
                console.log('Could not updateMany(from.userId)');
            }
        }
    );
    Messages.updateMany(
        {"to.userId": mongoose.Types.ObjectId(req.params.userId), "from.deletedThis": false},
        {updatedAt: Date.now(), "to.deletedThis": true},
        (error) => {
            if (error) {
                console.log('Could not updateMany(to.userId)');
            }
        }
    );

    Users.findByIdAndRemove(req.params.userId, (error, result) => {
        if (error) {
            return next(error);
        } else {
            res.json(result);
        }
    });
});


module.exports = router;
