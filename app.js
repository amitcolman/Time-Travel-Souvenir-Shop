
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const branchesRouter = require('./routes/branches');
const cartRouter = require('./routes/cart');
const dashboardRouter = require('./routes/dashboards');

const app = express();
const cors = require('cors');


const connectDB = require('./config/db');
connectDB();


const session = require('express-session');
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));
app.use(cors());


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/items', itemsRouter);
app.use('/branches', branchesRouter);
app.use('/cart', cartRouter);
app.use('/dashboards', dashboardRouter);


module.exports = app;
