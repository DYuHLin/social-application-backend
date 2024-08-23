const asyncHandler = require('express-async-handler');
const {body, validationResult} = require('express-validator');
const users = require('../Models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let refreshTokens = [];

const getAccessToken = (user) => {
    return jwt.sign({user}, 'secretkey', {expiresIn: '10h'});
};

const getRefreshToken = (user) => {
    return jwt.sign({user}, 'refreshsecretkey');
};

exports.post_login = asyncHandler(async (req, res, next) => {
    try{
        const user = await users.findOne({username: req.body.username}).populate('followers.user').exec();

        if(!user){
            console.log("Incorrect user");
            return res.json("username");
        };

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match){
            console.log("Incorrect Password");
            return res.json("password");
        };

        const accessToken = getAccessToken(user);
        const refreshToken = getRefreshToken(user);

        refreshTokens.push(refreshToken);

        await users.updateOne({user: req.body.user}, {$set: {
            online: true
        }});

        let tokens = {
            accessToken: accessToken,
            refreshToken: refreshToken
        };

        res.cookie('tokens', accessToken, {
        }).send();

    }catch(err){
        console.log(err);
    };
});

exports.refresh_token = asyncHandler(async (req, res, next) => {
    //token from user
    const refreshToken = req.body.token;
    //send error if there is no token or invalid
    if(!refreshToken) return res.status(403).json("You are not authenticated");
    if(refreshTokens.includes(refreshToken)){
        return res.status(403).json("refresh token is not valid");
    };
    jwt.verify(refreshToken, "refreshsecretkey", (err, user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        const newAccessToken = getAccessToken(user);
        const newRefreshToken = getRefreshToken(user);

        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    });
});

exports.post_logout = asyncHandler(async (req, res, next) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    await users.updateOne({username: req.body.username}, {$set: {
        online: false
    }});
    res.cookie('tokens', '', {httpOnly:true, expires: new Date(0)});
    res.status(200).json("You have logged out.");
});

exports.verifyToken = (req, res, next) =>{
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if(typeof bearerHeader !== "undefined"){
        //split the space in token
        const bearer = bearerHeader.split(" ");
        //get token from array
        const bearerToken = bearer[1];
        //set token
        req.token = bearerToken;
        //next middleware
        next();
    } else {
        res.sendStatus(403);
    };
};