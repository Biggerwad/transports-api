const operators = require('../../model/operator.mongo');
const host = require('../../model/host.mongo');
const Container = require('../../model/container.mongo');
const Users = require('../../model/user.mongo');
const FormStatus = require('../../model/formStatus');
const bcrypt = require("bcrypt");
const { mongoose } = require('mongoose');
const welcomeEmail = require('../../services/nodemailer');

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
        privilege,
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

// Login host
async function loginOperator(req, res) {
    const { username, email } = req.body;
    let hostExist;

    try {
        hostExist = await host.findOne({ username, email: email });
        if (hostExist) {
            return res.status(200).json({ ok: true, operator: hostExist });
        } else {
            return res.status(401).json({ ok: false, msg: "Operator does not exist" })
        }
    } catch (err) {
        return res.status(500).json({ msg: err });
    };

};

async function signinHost(req, res) {
    const { username, password } = req.body;

    // look up this host first
    const hostExist = await host.findOne({ username });

    if (hostExist) {
        // check for valid password
        let passwordValid = bcrypt.compare(password, hostExist.password);

        if (!passwordValid) return res.status(401).json({ msg: "Incorrect credentials" })

        return res.status(200).json({
            // token:
            msg: "login successful"
        })

        // give host a session ID and sign jwt token
    }
};

async function signupHost(req, res) {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    // check if account exists already

    try {
        const hostExist = await host.findOne({ username, email: email });

        if (!hostExist) {

            hashedPassword = bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return;
                }
                console.log('Hashed password:', hash);
                // Store this 'hash' in your database
            });

            // create account for host
            const newHost = await new host({
                hostId: Math.floor(Math.random() * 9000000) + 1000000,
                username: username,
                email: email,
                password: String(hashedPassword),
            }).save();

            if (newHost) {
                const sendWelcome = await welcomeEmail(newHost);

                return res.status(201).json({
                    ok: true,
                    hostId: newHost.hostId,
                    username: newHost.username,
                });

                // Add emailSent flag and resend logic
            };

        } else {
            return res.status(403).json({ ok: false, data: "user already exists" });
        }

    } catch (err) {
        res.status(500).json({
            err
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
    signupHost,
    httpsAddOperator,
    httpsAddContainer,
    modifyOperator,
    updateRequest,
    getFormStatus,
    setFormStatus
} 