const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notifications = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "Users"},
    other: {type: Schema.Types.ObjectId, ref: "Users"},
    text: {type: String},
    date: {type: Date, required: true, default: Date.now},
});

module.exports = mongoose.model('notifications', notifications); 