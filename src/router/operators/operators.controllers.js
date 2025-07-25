const operators = require('../../model/operator.mongo');
const host = require('../../model/host.mongo');
const Token = require('../../model/token.model');
const Container = require('../../model/container.mongo');
const Users = require('../../model/user.mongo');
const FormStatus = require('../../model/formStatus');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mongoose } = require('mongoose');
const { welcomeEmail, passwordResetLink, resetEmail } = require('../../services/nodemailer');

// Get all operators route:
async function httpsGetOperators(req, res) {
    return res.status(200).json(await host.find())
};

async function httpsGetRequests(req, res) {
    const { hostId } = req.body;

    const hostExist = await host.findOne({ hostId });

    if (!hostExist) return res.status(404).json({ ok: false, msg: "Host does not exist" });

    const allRequests = await hostExist.formData;
    return res.status(200).json(allRequests)

};

// implement httpsGetHosts also

async function httpsGetContainers(req, res) {
    return res.status(200).json(await Container.find())
};

async function getFormStatus(req, res) {
    // check if form exists
    const { hostId, formId } = req.params;

    // check if the form exists

    let formExists;

    try {
        formExists = await host.findOne({ hostId, formId });

        if (!formExists) {
            return res.status(403).json({
                ok: false,
                msg: "form does not exist"
            });
        };

        // if it does, check for the form status

        // revamp this to return boolean
        const dForm = await FormStatus.find();

        if (!dForm) {
            return res.status(403).json({ ok: false, msg: "form is closed" })
        } else {
            return res.status(200).json({ ok: true, status: dForm[0].status, owner: formExists.username, msg: "form exists" });
        }

        formExists, dForm = null;
        delete formExists;
        delete dForm;

    } catch (err) {
        return res.status(500).json({
            msg: err.message,
        })
    }
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
        hostId,
        fullName,
        email,
        privilege,
    } = req.body

    let existingOperator, hostExist;

    hostExist = await host.findOne({ hostId });

    // console.log(hostExist.operators);
    existingOperator = await hostExist.operators.filter((x) => x.email == email);

    try {
        if (hostExist) {
            console.log(existingOperator)
            // Check for operator under host
            if (existingOperator.length !== 0) {
                return res.status(403).json({ ok: false, msg: "Operator already exists" });
            };

            // Append into host' operators array 
            const newOperator = {
                hostId,
                fullName,
                email,
                privilege,
            };

            const appendOperator = await host.updateOne({ hostId }, {
                $push: {
                    operators: newOperator
                }
            });

            if (appendOperator) {

                // delete appendOperator;
                // handle the parsing of this data objects
                return res.status(201).json({
                    data: {
                        operatorName: newOperator.fullName,
                        email: newOperator.email,
                        privilege: newOperator.privilege,
                    }
                });
            } else {
                return res.status(403).json({ ok: false, msg: "Unable to append operator under host" });
            };


        } else {
            return res.status(403).json({ ok: false, msg: "Host does not exist" });
        }

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
    const { hostId, email, opType } = req.body;
    let hostExist;

    hostExist = await host.findOne({ hostId });

    try {
        if (hostExist) {
            // look for operator under host
            if (opType === "Operator") {
                const operatorExist = hostExist.operators.filter((x) => { x.email == email });
                if (!operatorExist) { return res.status(401).json({ ok: false, msg: "Operator does not exist" }) } else {
                    return res.status(200).json({ ok: true, operator: operatorExist });
                }
            };

            // Merge host signin logic here to compare password and find without hostId
            return res.status(200).json({ ok: true, operator: hostExist });
        } else {
            return res.status(401).json({ ok: false, msg: "Host does not exist" })
        }
    } catch (err) {
        return res.status(500).json({ ok: false, msg: err });
    };

};

async function signinHost(req, res) {
    const { email, password } = req.body;

    // look up this host first
    const hostExist = await host.findOne({ email });

    if (!hostExist) {
        return res.status(401).json({ ok: false, msg: "Operator does not exist" });
    };

    try {
        // check for valid password
        let passwordValid = bcrypt.compare(password, hostExist.password);

        if (!passwordValid) return res.status(401).json({ ok: false, msg: "Incorrect credentials" })

        return res.status(200).json({
            // token:
            ok: true,
            msg: "login successful",
            // don't return password here fix it
            operator: hostExist,
        })

    } catch (err) {
        res.status(500).json({
            err: err.message
        })
    }

    // give host a session ID and sign jwt token
};

async function signupHost(req, res) {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    // check if account exists already

    const hostExist = await host.findOne({ username, email: email });

    const token = jwt.sign({ email: email }, process.env.SUPER_SECRET, { expiresIn: "30m" });

    try {
        if (!hostExist) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const stageUser = {
                hostId: Math.floor(Math.random() * 9000000) + 1000000,
                username: username,
                email: email,
                password: String(hashedPassword),
                formId: Math.floor((Math.random() * 1000000) + 7000000),
                privilege: "Admin",
                token: token,
            };

            // create account for host
            const newHost = await new host(stageUser).save();

            const confLink = `${process.env.FE_API}confirm/${token}`;

            if (newHost) {
                const sendWelcome = await welcomeEmail(stageUser, confLink);

                if (sendWelcome) {
                    await host.updateOne({ email }, { $set: { emailSent: sendWelcome } }, { upsert: true })
                };

                // make host an operator too. can't be deleted though
                const makeOperator = await host.updateOne({ username }, {
                    $push: {
                        operators: {
                            hostId: stageUser.hostId,
                            fullName: stageUser.username,
                            email: stageUser.email,
                            privilege: stageUser.privilege,
                        }
                    }
                });

                // Handle operator delete operation too...

                if (!makeOperator) {
                    return res.status(403).json({ ok: false, data: "unable to make host an operator" });
                };

                return res.status(201).json({
                    ok: true,
                    hostId: newHost.hostId,
                    formId: newHost.formId,
                    // operators: newHost.operators,
                });

                // Add emailSent flag and resend logic
            }

            // insert else statement here

        } else {
            return res.status(403).json({ ok: false, data: "user already exists" });
        }

    } catch (err) {
        res.status(500).json({
            err: err
        })
    }
}

// CONFIRM EMAIL

async function confirmEmail(req, res) {
    const { token } = req.params;

    // look up this host first
    // const hostExist = await host.findOne({ email });

    // if (!hostExist) {
    //     return res.status(401).json({ ok: false, msg: "Operator does not exist" });
    // };

    // confirm token

    jwt.verify(token, process.env.SUPER_SECRET, async (err, decodedData) => {
        if (err) {
            return res.status(404).json({ ok: false, msg: "Invalid or expired Token" });
        } else {
            try {
                const confirm = await host.updateOne({ token }, { $set: { confirmed: true } })
                if (!confirm) return res.status(401).json({ ok: false, msg: "Unable to confirm" });

                return res.status(200).json({
                    // token:
                    ok: true,
                    msg: "Confirmed",
                    // Exclude hashed password
                    // operator: hostExist,
                })

            } catch (err) {
                res.status(500).json({
                    ok: false,
                    err: err.message
                })
            }
        }
    })

    // if (!tokenExist) {
    //     return res.status(404).json({ ok: false, msg: "Invalid or expired Token" });
    // };

    // // delete token
    // await tokenExist.deleteOne();


    // give host a session ID and sign jwt token
};

// password reset logic---
// when request hits server
// check if the email is a valid one.
// if true, check token model if the token exists, delete it
// then create a token and store it in a separate DB with the email and password
/* send password reset link to user with token*/
// once clicked --> frontend --> send new password to server and encrypt it and update storage
// Frontend, redirect user to sign in page to input new password

async function requestPasswordReset(req, res) {
    const { email } = req.body;

    const hostExist = await host.findOne({ email: email });

    if (!hostExist) {
        return res.status(401).json({ ok: false, msg: "Host does not exist" });
    };

    // check for token in DB
    let tokenExist = await Token.findOne({ userId: hostExist._id });

    if (tokenExist) {
        Token.findOneAndDelete({ userId: tokenExist.userId });
    };

    // hash this later on
    const newToken = jwt.sign({ _id: hostExist._id }, process.env.SUPER_SECRET, { expiresIn: "30m" });

    // send reset email
    await new Token({
        userId: hostExist._id,
        token: newToken,
    }).save();

    const resetLink = `${process.env.FE_API}/resetpassword/${newToken}`;

    const sendLink = await passwordResetLink(email, resetLink, hostExist.username);

    delete hostExist;

    if (!sendLink) {
        return res.status(500).json({ ok: false, msg: "error sending link to user" });
    } else {
        return res.status(200).json({ ok: true, msg: "link sent successfully!", token: newToken });
    };
};

async function resetPassword(req, res) {
    const { token, password } = req.body;
    const saltRounds = 10;

    // check for email
    // let userExists = await host.findOne({ email: email });

    // if (!userExists) {
    //     return res.status(401).json({ ok: false, msg: "Host does not exist" });
    // };

    // check for token validity
    jwt.verify(token, process.env.SUPER_SECRET, (err, decodedData) => {
        if (err) {
            return res.status(404).json({ ok: false, msg: "Invalid or expired Token" });
        }
    })

    // let tokenExist = await Token.findOne({ token: token });

    // if (!tokenExist) {
    //     return res.status(404).json({ ok: false, msg: "Invalid or expired Token" });
    // };

    const hash = await bcrypt.hash(password, saltRounds);
    // reset password
    await host.updateOne({ email }, { $set: { password: hash } }, { new: true });

    // send reset email
    const successEmail = await resetEmail(email, userExists.username);

    // delete token
    await tokenExist.deleteOne();

    userExists = null;
    delete userExists;

    if (!successEmail) {
        return res.status(500).json({ ok: false, msg: "error sending link to user" });
    } else {
        return res.status(200).json({ ok: true, msg: "password reset successful!" });
    };

    // delete token?
};

async function modifyOperator(req, res) {
    const { hostId, fullName, email, privilege } = req.body;

    const hostExist = await host.findOne({ email: email });

    if (!hostExist) {
        return res.status(401).json({ ok: false, msg: "Host does not exist" });
    };

    let updatedOperator;
    try {
        updatedOperator = await hostExist.findOne({ hostId }, {
            $set: {
                fullName: fullName,
                email: email,
                privilege: privilege,
            }
        }, { upsert: true });

        if (!updatedOperator) {
            res.status(401).json({ msg: "Error updating data" });
            alert('Error Updating operator!');
        }

        res.status(201).json({ Operator: updatedOperator });

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
    httpsGetRequests,
    httpsGetContainers,
    loginOperator,
    resetPassword,
    confirmEmail,
    requestPasswordReset,
    signinHost,
    signupHost,
    httpsAddOperator,
    httpsAddContainer,
    modifyOperator,
    updateRequest,
    getFormStatus,
    setFormStatus
} 