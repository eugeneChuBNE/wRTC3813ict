const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const dbURI = 'mongodb+srv://hiendatchu:10101010@cluster0.vne99iu.mongodb.net/chatDB?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

const routes = require('./routes/routes')
const adminRoutes = require('./routes/adminRoutes');
const adminModRoutes = require('./routes/adminModRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');


app = express()

app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200']
}))

app.use(express.json())

app.use('/api', routes)
app.use('/api', adminModRoutes);
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', chatRoutes);

app.listen(3000)