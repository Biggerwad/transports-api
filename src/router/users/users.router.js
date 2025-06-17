const express = require('express');
const { getUsers, addUser, deleteUser, deleteRequest } = require('./users.controllers')

const userRoute = express.Router();

userRoute.get('/', getUsers);
userRoute.post('/', addUser);
userRoute.delete('/', deleteRequest);

module.exports = userRoute;
