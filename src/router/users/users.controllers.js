const Users = require('../../model/user.mongo');
const Operator = require('../../model/operator.mongo');

// Return all registered users
async function getUsers(req, res) {
    try {
        const users = await Users.find({});
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Create user
async function addUser(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const {
        service,
        fullName,
        phone,
        // requestType,
        numOfPersons,
        address,
        geolocation,
        feedback,
        status,
    } = req.body;

    if (!service || !fullName || !phone || !numOfPersons || !address || !geolocation) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        let userExist = await Users.findOne({ phone: phone });

        if (userExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = await new Users({
            service,
            fullName,
            phone,
            // requestType,
            numOfPersons,
            address,
            geolocation,
            feedback,
            status,
        }).save();

        return res.status(201).json({
            data: newUser,
            ok: true,
        });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
}

// Delete Request:
async function deleteRequest(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Missing required ID" });
    }

    try {
        // Check if user exists
        let userExist = await Users.findOne({ _id: id });

        if (!userExist) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Delete user from the database
        await Users.deleteOne({ _id: id });

        return res.status(200).json({ message: "Request deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

module.exports = { getUsers, addUser, deleteRequest };