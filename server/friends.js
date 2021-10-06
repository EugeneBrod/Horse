const index = require('./index');
const login = require('./login');
const jwt = require('jsonwebtoken');
const database = require('./database');


function friend_search(req, res) {

    database.connect(res, function () {

        // Get list of users that match search.
        qry = `SELECT * FROM users WHERE username LIKE '${req.body.search_query}%'`
        database.query(res, qry, function(result) {

            // Add all matches to response dictionary
            var search_results = []
            Object.keys(result).forEach( function(key) {
                var dict = {
                    "user_id": result[key].user_id,
                    "username": result[key].username,
                    "stance": result[key].stance,
                    "rep": result[key].rep
                }
                search_results.push(dict)
            })
            data = {"search_results": search_results}
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(data));

        })
    })
}

function remove_friend(req, res) {
    var dict = req.body
    var queryer = req.session

    database.connect(res, function () {


        // Get friends user_id number
        qry = `SELECT * FROM users WHERE username = '${dict.user}'`
        database.query(res, qry, function(result) {
            if (result.length != 1) return res.status(409).send("Username doesn't exist.");
            dict.user_id = result[0].user_id

            qry = `DELETE FROM friends where (sender_id = '${queryer.user_id}' AND addressee_id = '${dict.user_id}') OR (sender_id = '${dict.user_id}' AND addressee_id = '${queryer.user_id}')`
            database.query(res, qry, function(result) {

                if (result.affectedRows == 0) {
                    res.status(200).send(`${dict.user} is not on your friends list.`)
                }

                if (result.affectedRows == 1) {
                    res.status(200).send(`${dict.user} has been removed from your friends list.`)
                }
            })
        })
    })
}

function add_friend(req, res) {
    var dict = req.body
    var queryer = req.session

    database.connect(res, function () {


        // Get aquaintance user_id number
        qry = `SELECT * FROM users WHERE username = '${dict.user}'`
        database.query(res, qry, function(result) {

            if (result.length != 1) return res.status(409).send("Username doesn't exist.");
            dict.user_id = result[0].user_id

            // Check if already friends
            qry = `SELECT * FROM friends WHERE (sender_id = '${queryer.user_id}' AND addressee_id = '${dict.user_id}') OR (sender_id = '${dict.user_id}' AND addressee_id = '${queryer.user_id}')`

            database.query(res, qry, function(result) {

                if (result.length > 1) {
                    res.status(400).send("Database corruption error.")
                    console.log("duplicate friendships in friendship table");
                    return
                }


                if (result.length == 0) {
                    qry = `INSERT INTO friends (sender_id, addressee_id, status) VALUES ('${queryer.user_id}', '${dict.user_id}', 'R')`
                    database.query(res, qry, function(result) {
                        res.status(200).send("Friend Request Send!");
                    })
                    return;
                }

                if (queryer.user_id == result[0].sender_id) {
                    if (result[0].status == 'R') {
                        res.status(200).send("Friendship pending approval")
                    }
                    if (result[0].status == 'B') {
                        res.status(200).send("User blocked you.")
                    }
                    if (result[0].status == 'D') {
                        res.status(200).send("Friendship declined")
                    }
                    if (result[0].status == 'A') {
                        res.status(200).send("Already friends")
                    }
                    return;
                }
                if (queryer.user_id == result[0].addressee_id) {
                    if (result[0].status == 'A') {
                        res.status(200).send("Already friends")
                        return;
                    }
                    
                    qry = `UPDATE friends SET status = 'A' WHERE sender_id = '${dict.user_id}' AND addressee_id = '${queryer.user_id}'`
                    database.query(res, qry, function(result) {
                        res.status(200).send("Friendship accepted!")
                    })
                }
            })
        })
    })
}

exports.friend_search = friend_search
exports.add_friend = add_friend
exports.remove_friend = remove_friend