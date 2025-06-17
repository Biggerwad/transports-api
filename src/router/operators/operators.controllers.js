const operators = require('../../model/operator.mongo');
const Container = require('../../model/container.mongo');
const Users = require('../../model/user.mongo');
const FormStatus = require('../../model/formStatus');
const bcrypt = require("bcrypt");
const { mongoose } = require('mongoose');

// Get all operators route:
async function httpsGetOperators(req, res) {
    return res.status(200).json(await operators.find())
}

async function httpsGetContainers(req, res) {
    return res.status(200).json(await Container.find())
}

async function getFormStatus(req, res) {
    return res.status(200).json(await FormStatus.find())
}

async function setFormStatus(req, res) {
    const { status } = req.body;

    try {
        const formStatus = await FormStatus.findOneAndUpdate(
            {},
            { $set: { status: status } },
            { new: true, upsert: true }
        );

        res.json(formStatus);
    } catch (err) {
        res.status(500).json({ error: 'Error updating status' });
    }
};

async function httpsAddOperator(req, res) {
    const {
        fullName,
        email,
        privilege
    } = req.body

    let existingOperator;

    try {
        existingOperator = await operators.findOne({ email: email });

        if (existingOperator) {
            return res.status(403).json({ error: "Admin already exists" });
        }

        const newOperator = await new operators({
            fullName,
            email,
            privilege,
        }).save()

        return res.status(201).json({
            data: {
                operatorName: newOperator.fullName,
                email: newOperator.email,
                privilege: newOperator.privilege,
            }
        });

    } catch (err) {
        data: {
            err
        }
    }
}

// Add geolocation to container.
async function httpsAddContainer(req, res) {
    const {
        geolocation,
        operatorId
    } = req.body;

    try {
        // Fetch the full operator object first
        const operator = await operators.findById(operatorId);
        if (!operator) {
            return res.status(404).json({ error: "Operator not found" });
        }

        // Find and update or create new container, embedding the full operator object
        const updatedContainer = await Container.findOneAndUpdate(
            { geolocation: geolocation },  // Find by geolocation
            {
                $set: {
                    geolocation,
                    operator: operator  // Embed the full operator object
                }
            },
            {
                new: true,   // Return the updated document
                upsert: true, // Create a new document if it doesn't exist
                runValidators: true
            }
        );

        // Success response
        return res.status(201).json(updatedContainer);

    } catch (err) {
        // Log the error for debugging
        console.error('Error in upsertContainer:', err);

        return res.status(500).json({ error: "Internal server error" });
    }
};

// Login opertaor
async function loginOperator(req, res) {
    const { email } = req.body;
    let operatorExists;

    try {
        operatorExists = await operators.findOne({ email: email });

        if (operatorExists) {
            return res.status(200).json({ success: true, operator: operatorExists });
        } else {
            return res.status(401).json({ success: false, msg: "Operator does not exist" })
        }
    } catch (err) {
        msg: err
    }
}

async function signupAdmin(req, res) {
    const { hostName, email, password } = req.body;

    // check if account exists already
    const userExist = await operators.findOne({ email })

    try {
        if (!userExist) {
            // create account for host
            const newUser = await new operators({
                fullName: hostName,
                email,
                password: string(bcrypt.hash(password, 10)),
                privilege: "Admin",
            }).save()

            if (newUser) {
                return res.status(201).json({
                    hostname: newUser.hostName,
                });
            }

        } else {
            return res.status(403).json({ data: "user already exists" });
        }
    } catch (err) {
        return res.json({
            data: "Error", err
        })
    }
}

async function modifyOperator(req, res) {
    const { id, fullName, email, privilege } = req.body;

    let foundOperator;
    try {
        foundOperator = await operators.findByIdAndUpdate(id, {
            $set: {
                fullName: fullName,
                email: email,
                privilege: privilege,
            }
        }, { upsert: true });

        if (!foundOperator) {
            res.status(401).json({ msg: "Error updating data" });
            alert('Error Updating operator!');
        }

        res.status(201).json({ Operator: foundOperator });

    } catch (err) {
        res.status(500).json(err)
    }
}

async function updateRequest(req, res) {
    const { request_id, status } = req.body;

    let request;

    try {
        request = await Users.findByIdAndUpdate(request_id,
            { $set: { status: status } },  // Use $set to update specific fields
            { upsert: true }
        );

        if (request) {
            return res.status(201).json({ msg: "success" });
        } else {
            res.status(404).json("Errors updating status!")
            return res.status(401).json({ data: "Error Updating Request." });
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

module.exports = {
    httpsGetOperators,
    httpsGetContainers,
    loginOperator,
    signupAdmin,
    httpsAddOperator,
    httpsAddContainer,
    modifyOperator,
    updateRequest,
    getFormStatus,
    setFormStatus
} 