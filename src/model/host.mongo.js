const mongoose = require('mongoose');
const Operators = require('./operator.mongo');

const hostSchema = new mongoose.Schema({
    hostId: {
        type: Number,
        required: true,
        unique:true,
        // min: 7,
        // max: 7,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    operators: [Operators],
    // formData: {
    //     type: Array,
    // inside each formdata we will have formId
    // },
    formId: {
        type: Number,
        min: 7,
    },
    privilege: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('Host', hostSchema);