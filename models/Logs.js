const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Logs = new Schema({
    when: {
        type: Date,
        default: Date.now,
        required: true,
        immutable: true
    },
    action: {
        type: String,
        enum: ["LOGIN", "LOGOUT", "REGISTER"],
        required: true,
        immutable: true
    },
    success: {
        type: Boolean,
        required: true,
        immutable: true
    },
    resultMessage: {
        type: String,
        required: true,
        immutable: true
    },
    actor: {
        type: {
            userId: Schema.Types.ObjectId,
            username: String,
            email: String
        },
        required: true,
        immutable: true
    },
    ip: {
        type: String,
        required: true,
        immutable: true
    },
    browser: {
        type: String,
        required: true,
        immutable: true
    }
}, {
    collection: "logs"
});

module.exports = mongoose.model('Logs', Logs);
