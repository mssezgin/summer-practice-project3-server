const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Messages = new Schema({ // TODO: add delivered (?)
    when: {
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
    seen: {
        type: Boolean,
        default: false,
        required: true
    },
    from: {
        type: {
            userId: Schema.Types.ObjectId,
            username: String,
            deletedThis: {
                type: Boolean,
                default: false,
                required: true
            }
        },
        required: [true, "From cannot be empty."]
    },
    to: {
        type: {
            userId: Schema.Types.ObjectId,
            username: String,
            deletedThis: {
                type: Boolean,
                default: false,
                required: true
            }
        },
        required: [true, "To cannot be empty."]
    },
    subject: {
        type: String,
        maxlength: [128, "Subject cannot be longer than 128 characters."]
    },
    body: String
}, {
    collection: "messages"
});

module.exports = mongoose.model('Messages', Messages);
