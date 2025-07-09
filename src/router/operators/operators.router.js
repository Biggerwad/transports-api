const express = require('express');

const {
    httpsGetOperators,
    httpsAddOperator,
    httpsAddContainer,
    modifyOperator,
    signupAdmin,
    loginOperator,
    updateRequest,
    httpsGetContainers,
    getFormStatus,
    setFormStatus,
    signupHost,
    checkValidForm
} = require('./operators.controllers');
// const addOperator = require('./operators.controllers')

const operatorRoute = express.Router();

operatorRoute.get('/', httpsGetOperators);
operatorRoute.post('/', loginOperator);
operatorRoute.post('/signup', signupHost);
// operatorRoute.post('/form', checkValidForm);

operatorRoute.post('/add', httpsAddOperator);
operatorRoute.post('/modify', modifyOperator);

operatorRoute.post('/assign', httpsAddContainer);
operatorRoute.get('/assign', httpsGetContainers);

operatorRoute.post('/status', updateRequest)

operatorRoute.get('/formstatus', getFormStatus)
operatorRoute.post('/formstatus?hostId', setFormStatus)

// operatorRoute.delete('/deleteoperator', httpsDeleteOperator)

module.exports = operatorRoute;