const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
    hostId: {
        type: Number,
        required: true,
        // min: 7,
        // max: 7,
    },
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
    // requests: {
    //     type: Object,
    // },
    formID: {
        type: Number,
        min: 7,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('Host', hostSchema);