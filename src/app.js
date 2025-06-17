const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const operatorRoute = require('./router/operators/operators.router');
const userRoute = require('./router/users/users.router')


const app = express();

app.use(express.json());
app.use(morgan('combined'));

app.use(cors({
    origin: ['http://localhost:3000', 'https://transport-444705.nn.r.appspot.com/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use('/requests', userRoute);
app.use('/operator', operatorRoute);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})

module.exports = app;