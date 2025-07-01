const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    requests: {
        type: Object,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('Host', hostSchema);