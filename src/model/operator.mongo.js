const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    privilege: {
        type: String,
        required: true,
    },
},
    { timestamps: true }

)

module.exports = operatorSchema