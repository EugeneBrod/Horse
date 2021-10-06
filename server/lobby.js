const login = require('./login');
const database = require('./database');
const comm = require('./communications')

/*
game_session statuses:
    'P' = pending lobby (waiting for players to ready up)
    'E' = post game lobby
    'A' = active game
*/

function create_session(req, res) {

    login.verify_user(req, res, function (queryer) {

        database.connect(res, function () {

            // Check that user isn't in a session currently
            check_if_user_already_in_session(res, queryer.user_id, function() {

                // Create new session.
                qry = `INSERT INTO game_sessions (session_id, status) VALUES (NULL, 'P'); INSERT INTO session_members (session_id, user_id, host) VALUES (LAST_INSERT_ID(), '${queryer.user_id}', '1');`
                database.query(res, qry, function(result) {
                    // Return session id
                    data = { "session_id": result[0].insertId}
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(data))

                })
            })
        })
    })
}

function join_session(req, res) {

    data = {
        "message": ""
    }

    login.verify_user(req, res, function (queryer) {

        database.connect(res, function () {

            // Check that user isn't in a session currently
            check_if_user_already_in_session(res, queryer.user_id, function() {

                // If requested lobby exists and hasn't started, add client to game session.
                qry = `CALL add_user_to_lobby(${queryer.user_id}, ${req.body.session_id})`
                database.query(res, qry, function(result) {
                    if (result.affectedRows == 0) {
                        res.setHeader('Content-Type', 'application/json');
                        data.message = "game_session doesn't exist or game_session is already in progress."
                        res.status(409).end(JSON.stringify(data))
                        return
                    }
                    data.message = "successfully joined game_session."
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(data))
                    return
                })
            })
        })
    })
}

function launch(req, res) {
    data = {"message": ""}
    login.verify_user(req, res, function(queryer) {

        database.connect(res, function() {

            check_if_user_in_session(res, queryer.user_id, function() {

                qry = `SELECT host FROM session_members WHERE user_id = '${queryer.user_id}'`
                database.query(res, qry, function(result) {
                    if (result[0].host == 0) {
                        data.message = "You are not the host, you cannot launch the game."
                        res.setHeader('Content-Type', 'application/json');
                        res.status(409).end(JSON.stringify(data))
                        return
                    }
                    qry = `SELECT ready, user_id FROM session_members WHERE session_id = '${req.body.session_id}'`
                    database.query(res, qry, function(result) {
                        var players = []
                        Object.keys(result).forEach(function(key) {
                            var row = result[key]
                            players.push(row.user_id)
                            if (row.ready != 1) {
                                data.message = "Not all players are ready."
                                res.setHeader('Content-Type', 'application/json');
                                res.status(409).end(JSON.stringify(data))
                                return
                            }
                        })

                        // All players ready change game state to "A" for active
                        qry = `UPDATE game_sessions SET status = 'A' WHERE session_id = '${req.body.session_id}'`
                        database.query(res, qry, function(result) {
                            // players = shuffle(players)
                            var tasksToGo = players.length
                            Object.keys(players).forEach(function(key) {
                                qry = `UPDATE session_members SET set_order = '${key}' WHERE user_id = '${players[key]}';`
                                database.query(res, qry, function(result) {
                                    if (--tasksToGo == 0) {
                                        qry = `UPDATE game_sessions SET num_players = '${players.length}' WHERE session_id = '${req.body.session_id}';`
                                        database.query(res, qry, function (result) {
                                            data.message = "Game session now active!"
                                            res.setHeader('Content-Type', 'application/json');
                                            res.status(200).end(JSON.stringify(data))
                                        })
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

function set_ready(req, res) {
    data = {
        "message": ""
    }

    login.verify_user(req, res, function(queryer) {

        database.connect(res, function() {

            check_if_user_in_session(res, queryer.user_id, function() {

                qry = `UPDATE session_members SET ready = 1 WHERE user_id = '${queryer.user_id}'`
                database.query(res, qry, function(result) {
                    if (result.affectedRows == 0) {
                        data.message = "you are not currently part of any session"
                        res.setHeader('Content-Type', 'application/json');
                        res.status(409).end(JSON.stringify(data))
                        return
                    }
                    data.message = "You are ready to play, waiting for all players to ready up and then host can launch the game."
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).end(JSON.stringify(data))
                    return
                })
            })
        })
    })
}



exports.create_session = create_session;
exports.join_session = join_session;
exports.set_ready = set_ready;
exports.launch = launch;

function check_if_user_already_in_session(res, user_id, callback) {
    qry = `SELECT * FROM session_members WHERE user_id = '${user_id}'`
    database.query(res, qry, function(result) {
        if (result.length == 1) {
            var data = { "session_id": result[0].session_id,
                        "message": `You are already in session ${result[0].session_id}.`
                    }
            res.setHeader('Content-Type', 'application/json');
            res.status(409).end(JSON.stringify(data))
            return;
        }
        callback()
    })
}

function check_if_user_in_session(res, user_id, callback) {
    qry = `SELECT * FROM session_members WHERE user_id = '${user_id}'`
    database.query(res, qry, function(result) {
        if (result.length == 0) {
            var data = { "session_id": result[0].session_id,
                        "message": `You are not in a session.`
                    }
            res.setHeader('Content-Type', 'application/json');
            res.status(409).end(JSON.stringify(data))
            return;
        }
        callback()
    })
}

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
