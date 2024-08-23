const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    username: {type: String, required: true},
    bio: {type: String},
    email: {type: String, required: true},
    password: {type: String, required: true},
    image: {type: String, required: true},
    followers: [
        {user: {type: Schema.Types.ObjectId, ref: "Users"}}
    ],
    online: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('Users', userSchema);