const index = require('./index');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const database = require('./database');
const auth = require('./auth');
const ITERATIONS = 100;
const HASH_LENGTH = 255;
const comm = require('./communications')

function signup(req, res) {
    /*
    required params in request:
        username
        password
        stance
    */
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
        database.query(res, qry, function (result) {
            if (result.length != 0) return res.status(409).send("Username already exists");

            // Hash the salted password.
            var salt = crypto.randomBytes(HASH_LENGTH).toString('base64').substring(0, 255);

            crypto.pbkdf2(dict.password, salt, ITERATIONS, HASH_LENGTH, 'sha1', function (err, hash) {
                // Submit new account to database
                hash = hash.toString('base64').substring(0, 255);
                qry = `INSERT INTO users (username, hash, salt, stance) VALUES ('${dict.username}', '${hash}', '${salt}', '${dict.stance}')`;
                database.query(res, qry, function (result) {
                    comm.send(res, 200, {}, `Welcome to Skate ${dict.username}! Try logging in.`)
                });
            });
        });
    });
};

function remove_user(req, res) {
    var dict = req.body

    decoded = req.session

    database.connect(res, function () {

        // See that username exists.
        qry = `SELECT * FROM users WHERE username = '${decoded.username}'`
        database.query(res, qry, function (result) {

            if (result.length != 1) return res.status(409).send("Invalid username/password.");

            // Check that token belongs to intended user.
            if (result[0].hash != decoded.hash) return res.status(400).send("Invalid username/password.");
            qry = `DELETE FROM users WHERE user_id = '${decoded.user_id}'`;
            database.query(res, qry, function (result) {
                return res.status(200).send(`Successfully deleted user: ${decoded.username}.`)
            })
        })
    })
}

function login(req, res) {
    /* 
    required params in request:
        username
        password
    */
    var dict = req.body;
    console.log(dict)

    database.connect(res, function () {


        // See that username exists.
        qry = `SELECT * FROM users WHERE username = '${dict.username}'`;
        database.query(res, qry, function (result) {

            if (result.length != 1) {
                return comm.send(res, 409, {}, "Invalid username/password.")
            }


            // Check that password is valid.
            crypto.pbkdf2(dict.password, result[0].salt, ITERATIONS, HASH_LENGTH, 'sha1', function (err, hash) {
                hash = hash.toString('base64').substring(0, 255);
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

                auth.dispenseToken(payload, function (token) {
                    data = {
                        "token": token,
                        "username": result[0].username,
                        "stance": result[0].stance,
                        "rep": result[0].rep,
                        "date_created": result[0].date_created,
                        "user_id": result[0].user_id
                    }
                    console.log(data)
                    comm.send(res, 200, data, 'Session token is in this response.')
                })
            });
        });
    });
};

exports.login = login;
exports.signup = signup;
exports.remove_user = remove_user;