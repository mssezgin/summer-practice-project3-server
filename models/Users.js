const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Users = new Schema({ // TODO: add online, lastSeen
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "{VALUE} is not a valid email."],
        required: [true, "E-mail cannot be empty."],
        unique: [true, "{VALUE} already exists."]
    },
    username: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Username cannot be empty."],
        unique: [true, "{VALUE} already exists."]
    },
    password: {
        type: String, // TODO: use hashing
        minlength: [8, "Password must be at least 8 characters."],
        required: true
    },
    firstname: {
        type: String,
        trim: true
    },
    lastname: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    birth: {
        type: Date,
        max: Date.now()
    }
}, {
    collection: "users"
});

module.exports = mongoose.model('Users', Users);
