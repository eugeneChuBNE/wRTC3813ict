const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

// Database connection
const dbURI = 'mongodb+srv://hiendatchu:10101010@cluster0.vne99iu.mongodb.net/chatDB?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

// Import routes
const routes = require('./routes/routes');
const adminRoutes = require('./routes/adminRoutes');
const adminModRoutes = require('./routes/adminModRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middlewares
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200'] 
}));
app.use(express.json());

// Routes
app.use('/api', routes);
app.use('/api', adminRoutes);
app.use('/api', adminModRoutes);
app.use('/api', userRoutes);
app.use('/api', chatRoutes);

// Create HTTP server and pass the Express app to it
const server = http.createServer(app);

// Attach Socket.IO to the server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200", // your frontend server
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Require the socket.js file and pass the io instance to it
require('./socket')(io);

// Listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;