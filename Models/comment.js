const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "Users", required: true},
    reply: {type: Schema.Types.ObjectId, ref: "Posts", required: true},
    text: {type: String},
    link: {type: String},
    video: {type: String},
    youtube: {type: String},
    date: {type: Date, required: true, default: Date.now},
    pics: [],
    likes: [
        {user: {type: Schema.Types.ObjectId, ref: "Users"}}
    ],
});

module.exports = mongoose.model('Comments', commentSchema);