const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const dbURI = 'mongodb+srv://hiendatchu:10101010@cluster0.vne99iu.mongodb.net/chatDB?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

const routes = require('./routes/routes');
const adminRoutes = require('./routes/adminRoutes');
const adminModRoutes = require('./routes/adminModRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200']
}));

app.use(express.json());

app.use('/api', routes);
app.use('/api/admin', adminRoutes);
app.use('/api/adminmod', adminModRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Require the socket.js file and pass the io instance to it
require('./socket')(io);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
