const Users = require('../../model/user.mongo');
const Operator = require('../../model/operator.mongo');
const Hosts = require('../../model/host.mongo');

// Return all registered users
async function getUsers(req, res) {
    const { hostId } = req.params;

    const hostExist = await Hosts.findOne({ hostId });

    if (!hostExist) return res.status(404).json({ ok: false, msg: "Host does not exist" });

    const allRequests = hostExist.formData;
    return res.status(200).json(allRequests)

};

// Create user
async function addUser(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }
    const { hostId } = req.params;

    if (!hostId) return res.status(404).json({ message: "HostId and formId missing" });

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
    };

    try {
        let hostExist = await Hosts.findOne({ hostId });

        if (!hostExist) return res.status(404).json({ ok: false, msg: "Host does not exist" });

        let userExist = hostExist.formData.filter((x) => { x.phone === phone });

        if (userExist.length !== 0) {
            return res.status(409).json({ ok: false, msg: "User already exists" });
        };

        const newFormData = {
            hostId: hostId,
            service,
            fullName,
            phone,
            // requestType,
            numOfPersons,
            address,
            geolocation,
            feedback,
            status,
        };

        const appendFormData = await Hosts.updateOne({ hostId }, {
            $push: {
                formData: newFormData
            }
        });

        if (!appendFormData) return res.status(404).json({ message: "Unable to append formData to host" });

        return res.status(201).json({
            data: newFormData,
            ok: true,
        });

    } catch (err) {
        return res.status(500).json({ ok: false, msg: err.message });
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