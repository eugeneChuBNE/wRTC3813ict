const express = require('express');
const mongoose = require('mongoose');

const app = express();

//app.use(cors());

const dbURI = 'mongodb+srv://hiendatchu:10101010@cluster0.vne99iu.mongodb.net/chatDB?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

app.get('/', (req, res) => {
    res.send('Server Running');
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Main server on port ${PORT}`));
