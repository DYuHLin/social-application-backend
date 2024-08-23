const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const auth = require('./Routers/authRoutes');
const comment = require('./Routers/commentRoutes');
const posts = require('./Routers/postRoutes');
const notifications = require('./Routers/NotificationsRoutes');
const socket = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND, 
    credentials: true,
    methods: ['GET','PUT','POST','DELETE'],
    optionSuccessStatus:200,
}));
app.use(express.json({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(session({secret: "cats", resave: false, saveUninitialized: true}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URL;

async function main(){
    mongoose.connect(mongoDB);
};

main().catch((err) => console.log(err));

app.use('/api/auth', auth);
app.use('/api/posts', posts);
app.use('/api/comment', comment);
app.use('/api/notifications', notifications);


const server = app.listen(process.env.PORT, () => console.log('App is listening'));

const io = socket(server, {
    cors: {
        origin: process.env.FRONTEND, 
        credentials: true,
        methods: ['GET','PUT','POST','DELETE'],
        optionSuccessStatus:200,
    }
});

io.on('connection', (socket) => {
    console.log('connected:' +socket.id);

    socket.on('join_post', (data) => {
         console.log(`user ${socket.id} joined the room ${data}`)
         socket.join(data);
    });

    socket.on('send_post', (data) => {
         socket.broadcast.emit('get_posts', data);
         console.log(data);
    });

    socket.on('send_comment', (data) => {
        socket.to(data.post).emit('get_comments', data);
        console.log(data);
   });

    socket.on('disconnect', () => {
        console.log('disconnected:' + socket.id);
    });
});