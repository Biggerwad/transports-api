const express = require('express');
const { getUsers, addUser, deleteUser, deleteRequest } = require('./users.controllers')

const userRoute = express.Router();

userRoute.get('/:hostId', getUsers);
userRoute.post('/:hostId', addUser);
userRoute.delete('/', deleteRequest);

module.exports = userRoute;