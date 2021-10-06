const index = require('./index');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const database = require('./database')
const ITERATIONS = 100;
const HASH_LENGTH = 255;

function signup (req, res) {
    var dict = req.body;
    // Check that username has been provided.
    if (dict.username == undefined || dict.username.length == 0) {
        res.setHeader('Content-Type', 'application/json');
        data = {
            "msg": 'No name provided'
        }
        return res.status(200).send(JSON.stringify(data));
    }
    
    database.connect(res, function () {


        // Check that given username is unique.
        qry = `SELECT * FROM users WHERE username = '${dict.username}'`
        database.query(res, qry, function(result) {
            if (result.length != 0) return res.status(409).send("Username already exists");

            // Hash the salted password.
            var salt = crypto.randomBytes(HASH_LENGTH).toString('base64').substring(0, 255);

            crypto.pbkdf2(dict.password, salt, ITERATIONS, HASH_LENGTH, 'sha1', function (err, hash) {
                // Submit new account to database
                hash = hash.toString('base64').substring(0, 255);
                qry = `INSERT INTO users (username, hash, salt, stance) VALUES ('${dict.username}', '${hash}', '${salt}', '${dict.stance}')`;
                database.query(res, qry, function(result) {
                    return res.status(200).send(`Welcome to Skate ${dict.username}! Try logging in.`);
                });
            });
        });
    });
};

function remove_user(req,res) {
    var dict = req.body

    verify_user(req, res, function(decoded) {

        database.connect(res, function () {
    
            // See that username exists.
            qry = `SELECT * FROM users WHERE username = '${decoded.username}'`
            database.query(res, qry, function(result) {
    
                if (result.length != 1) return res.status(409).send("Invalid username/password.");
    
                // Check that token belongs to intended user.
                if (result[0].hash != decoded.hash) return res.status(400).send("Invalid username/password.");
                qry = `DELETE FROM users WHERE user_id = '${decoded.user_id}'`;
                database.query(res, qry, function(result) {
                    return res.status(200).send(`Successfully deleted user: ${decoded.username}.`)
                })
            })
        })
    })
}

function login(req, res) {
    var dict = req.body;
    
    database.connect(res, function () {


        // See that username exists.
        qry = `SELECT * FROM users WHERE username = '${dict.username}'`;
        database.query(res, qry, function(result) {
            if (result.length != 1) return res.status(409).send("Invalid username/password.");

            // Check that password is valid.
            crypto.pbkdf2(dict.password, result[0].salt, ITERATIONS, HASH_LENGTH, 'sha1', function (err, hash) {
                hash = hash.toString('base64').substring(0,255);
                if (err) return res.status(400).send("Error generating hash");

                if (result[0].hash != hash) return res.status(400).send("Invalid username/password.");
                // Create session token for client.
                payload = {
                    "username": result[0].username,
                    "hash": result[0].hash,
                    "stance": result[0].stance,
                    "rep": result[0].rep,
                    "user_id": result[0].user_id
                }
                jwt.sign(payload, process.env.JWT_SECRET, function (err, token) {
                    if (err) {
                        res.status(400).send("Something went wrong creating a session token.");
                        throw err;
                    }
                    res.setHeader('Content-Type', 'application/json');
    
                    data = {
                        "token": token,
                        "stance": dict.stance,
                        "rep": dict.rep,
                        "date_created": dict.date_created
                    }
                    res.status(200).send(JSON.stringify(data));
                });
            }); 
        });
    });
};

function verify_user(req, res, callback) {
    jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, queryer) {
        if (err) {
            res.status(400).send("Invalid session token.");
            throw err
        }
        callback(queryer)
    })
}



exports.login = login;
exports.signup = signup;
exports.remove_user = remove_user;
exports.verify_user = verify_user;