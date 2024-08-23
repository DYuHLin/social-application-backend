const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const users = require('../Models/user');
const posts = require('../Models/posts');
const comments = require('../Models/comment');
const notifications = require('../Models/Notifications');

exports.post_register = asyncHandler(async (req, res, next) => {
    try{
        const user = await users.findOne({username: req.body.username});
        if(user){
            console.log("username taken");
            return res.json("failed");
        };

        if(!user){
            bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
                if(err){
                    return next(err);
                } else if(req.body.password !== req.body.confirmedPassword){
                    return res.json("match"); 
                } else {
                    const user = new users({
                        name: req.body.name,
                        surname: req.body.surname,
                        username: req.body.username,
                        bio: req.body.bio,
                        email: req.body.email,
                        password: hashedPassword,
                        image: req.body.image,
                        followers: [],
                        online: false
                    });
                    await user.save();
                    return res.json("ok");
                };
            });
        }  
    }catch(err){
        next(err);
    };
});

exports.update_acc = asyncHandler(async (req, res, next) => {
    try{
        const user = await users.findOne({username: req.body.username});
        if(user){
            console.log("username taken");
            return res.json("failed");
        };

        if(!user){
            await users.updateOne({_id: req.params.id}, {$set: {
                name: req.body.name,
                surname: req.body.surname,
                username: req.body.username,
                bio: req.body.bio,
                email: req.body.email,
                image: req.body.image
            }});
            res.cookie('tokens', '', {httpOnly:true, expires: new Date(0)});
            return res.json("ok");
        } else if(user.username === req.body.username){
            await users.updateOne({_id: req.params.id}, {$set: {
                name: req.body.name,
                surname: req.body.surname,
                username: req.body.username,
                bio: req.body.bio,
                email: req.body.email,
                image: req.body.image
            }});
            return res.json("ok");
        } else {
            return res.json('exist');
        };
         
    }catch(err){
        next(err);
    };
});

exports.update_password = asyncHandler(async(req, res, next) => {
    const user = await users.findOne({username: req.body.username}).populate('followers.user').exec();
    const match = await bcrypt.compare(req.body.password, user.password);
    if(!match){
        console.log("Incorrect Password");
        return res.json("password");
    }

    bcrypt.hash(req.body.newPassword, 10, async(err, hashedPassword) => {
        if(err){
            return next(err);
        } else if(req.body.newPassword !== req.body.confirmedPassword){
            return res.json("match"); 
        } else {
            await users.updateOne({_id: req.params.id}, {$set: {
                password: hashedPassword,
            }});
            res.cookie('tokens', '', {httpOnly:true, expires: new Date(0)});
            res.json('ok')
        };
    });
});

exports.add_follower = asyncHandler(async (req, res, next) => {
    const findFollower = await users.findOne({_id: req.params.id, 'followers.user': req.body.followerId});
    if(findFollower){
        await users.findOneAndUpdate({_id: req.params.id}, {
            $pull: {
                followers: {user: req.body.followerId}
            }
        });
        return res.json('deleted');
    } else{
        await users.updateOne({_id: req.params.id}, {$push: {followers: {user: req.body.followerId}}});
        const noti = new notifications({
            user: req.body.followerId, other: req.params.id, text: 'started following you.', date: Date.now() 
           });
        await noti.save();
        return res.json('ok');
    }
});

exports.get_users = asyncHandler(async (req, res, next) => {
    const usersList = await users.find().populate('followers.user').exec();

    return res.json(usersList);
});

exports.get_user = asyncHandler(async (req, res, next) => {
    const user = await users.findById(req.params.id).populate('followers.user').exec();

    return res.json(user);
});

exports.post_delete = asyncHandler(async (req, res, next) => {
    await users.findByIdAndDelete(req.params.id);
    await posts.deleteMany({user: req.params.id});
    await comments.deleteMany({user: req.params.id});
    await users.updateMany({'followers.user': req.params.id}, {$pull: {followers: {user: req.params.id}}});
   res.cookie('tokens', '', {httpOnly:true, expires: new Date(0)});
   return res.json('removed');
});

exports.fetch_followers = asyncHandler(async (req, res, next) => {
    const followers = await users.find({'followers.user': req.params.id}).exec();

    return res.json(followers);
});