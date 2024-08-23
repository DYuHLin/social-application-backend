const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const notifications = require('../Models/Notifications');

// async function createNotification(user, other, reply, text) {
//     const noti = new notifications({ user: user, other: other, reply: reply, text: text, date: Date.now() });
//     await noti.save();
//     const notification = await noti.populate('user');
//     return notification;
//   };

exports.get_notifications = asyncHandler(async(req, res, next) => {
    const notis = await notifications.find({other: req.params.id}).populate('user').exec();

    return res.json(notis);
});

exports.delete_notifications = asyncHandler(async(req, res, next) => {
    await notifications.deleteMany({other: req.params.id});
    return res.json('deleted');
});