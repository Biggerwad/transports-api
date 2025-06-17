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
    password: {
        type: String,
        // will make this required when operator schema is reviewed
    },
    privilege: {
        type: String,
        required: true,
    }
},
    { timestamps: true }

)

module.exports = mongoose.model('Operator', operatorSchema);