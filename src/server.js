const fs = require('fs');
const http = require("http");
const mongoose = require('mongoose');
const cronTask = require('./services/cronTask');

const app = require("./app");

const server = http.createServer(app);

require('dotenv').config();

const PORT = process.env.PORT || 5000;

const MONGO_URL = process.env.MONGO_URL;

// mongoose.connection.once('open', () => {
//     console.log('MongoDB connection ready!');
// });

async function startServer() {
    await mongoose.connect(MONGO_URL);
    // {
    // key: fs.readFileSync('key.pem'),
    // cert: fs.readFileSync('cert.pem')
    // },

    server.listen(PORT, () => {
        console.log(`Port is UP and Running @ port: ${PORT}`)
    })
}

startServer();