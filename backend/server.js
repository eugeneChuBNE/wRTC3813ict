const express = require('express')
const app = express()
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
var routes = require('./routes/auth');
const cors = require('cors');

app.use(cors(
  {
    origin: "http://localhost:4200"
  }
));

const PORT = 3000;

app.listen(PORT, () => console.log(`Main server on port ${PORT}`));

const dbURI = 'mongodb+srv://hiendatchu:10101010@cluster0.vne99iu.mongodb.net/chatDB?retryWrites=true&w=majority'; 
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to db'))
    .catch((err) => console.log(err));

app.use(express.json());
app.use(routes);