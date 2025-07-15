const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Host",
    },    
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        // required: true,
        default: Date.now(),
    }
});

module.exports = mongoose.model('Token', tokenSchema);