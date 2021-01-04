const express = require('express');
const app = express();
const router = require('./routers');
require('dotenv').config();

// const passport = require('passport');
// const session = require('express-session');



app.use(express.json());

app.use('/', router);
// app.use(express.json());


const Port = process.env.PORT || 3000;


app.listen(Port, () => {
    console.log(`server is working ${Port}`);
});