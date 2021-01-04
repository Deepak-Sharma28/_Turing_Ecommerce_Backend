const Router = require('express').Router();
const confiq = require('./knexfile').development;
const knex = require('knex')(confiq);
const jwt = require('jsonwebtoken');
const isVerify = require('./Auth/isVerify');



require('./controller/departments')(knex, Router);
require('./controller/attribute')(knex, Router);
require('./controller/Categories')(knex, Router);
require('./controller/Product')(knex, Router, isVerify);
require('./controller/Customers')(knex, Router, jwt, isVerify);
require('./controller/Orders')(knex, Router, isVerify);
require('./controller/Tax')(knex, Router);
require('./controller/Shipping')(knex, Router);
require('./controller/ShoppingCart')(knex, Router);


module.exports = Router;