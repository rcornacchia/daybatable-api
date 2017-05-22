const express       = require('express');
const loginRoute    = require('./loginRoute');
const registerRoute = require('./registerRoute');
const authRoutes    = express.Router();

authRoutes.use('/authenticate', loginRoute);
authRoutes.use('/register', registerRoute);

module.exports = authRoutes;