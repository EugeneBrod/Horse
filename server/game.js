const database = require('./database')
const login = require('./login')
const comm = require('./communications')


function request(req, res) {
    var data = {}

    // response types: 
    // "fault" -> no game in session
    // "waiting" -> you are not setter and setter has not set
    // "defend" -> you are not setter and setter has set
    // "set" -> you are setter and have not set
    // "done" -> done with the current round
    // "lost" -> met max number of strikes
    var queryer = req.session

    database.connect(res, function () {

        // check that game in session
        qry = `SELECT status FROM game_sessions WHERE session_id = '${req.body.session_id}'`
        database.query(res, qry, function (result) {
            if (result.length == 0) {
                data.type = "fault"
                comm.send(res, 400, data, "Game session does not exist.")
                console.log("game doesn't exist\n")
                return;
            }
            if (result[0].status != 'A') {
                data.type = "fault"
                comm.send(res, 409, data, "Game not in session.")
                console.log(`game ${req.body.session_id} not in session\n`)
                return;
            }

            // check that i haven't lost
            qry = `SELECT lost FROM session_members WHERE user_id = '${queryer.user_id}'`
            database.query(res, qry, function (result) {
                if (result[0].lost == 1) {
                    data.type = "lost"
                    comm.send(res, 200, data, "You are out of the game.")
                    console.log(`player with id ${queryer.user_id} player lost\n`)
                    return;
                }


                // find the setter
                qry = `SELECT session_members.user_id, session_members.tried FROM session_members INNER JOIN game_sessions ON game_sessions.setter = session_members.set_order WHERE game_sessions.session_id = '${req.body.session_id}'`
                database.query(res, qry, function (result) {

                    // if i am not the setter
                    if (result[0].user_id != queryer.user_id) {
                        
                        // if setter has tried already, I should be defending or done
                        if (result[0].tried == 1) {
                            qry = `SELECT tried FROM session_members WHERE user_id = '${queryer.user_id}'`
                            database.query(res, qry, function (result) {

                                // if I tried already, I am done for round
                                if (result[0].tried == 1) {
                                    data.type = "done"
                                    comm.send(res, 200, data, "You are done for this round")
                                    console.log(`user_id ${queryer.user_id} done for the round\n`)
                                    return;
                                }

                                // if I havn't tried, then I am defending
                                if (result[0].tried == 0) {
                                    data.type = "defend"
                                    comm.send(res, 200, data, "You need to defend against the set trick.")
                                    console.log(`User with id ${queryer.user_id} must defend\n`)
                                    return;
                                }
                            })
                        }
                        // if setter hasn't tried already, I should be waiting
                        if (result[0].tried == 0) {
                            data.type = "wait"
                            comm.send(res, 200, data, "You are waiting for setter to set the trick.")
                            console.log(`User with id ${queryer.user_id} is waiting for the setter\n`)
                            return;
                        }

                    }
                    // if I am the setter
                    if (result[0].user_id == queryer.user_id) {

                        // if I have tried, I'm done
                        if (result[0].tried == 1) {
                            data.type = "done"
                            console.log(`User with id ${queryer.user_id} is waiting for others to defend against their set.\n`)
                            comm.send(res, 200, data, "Waiting for others to defend.")
                            return;
                        }

                        // if I haven't tried, I am setting
                        if (result[0].tried == 0) {
                            data.type = "set"
                            console.log(`Waiting on user with id ${queryer.user_id} to set the trick.\n`)
                            comm.send(res, 200, data, "Waiting for you to set the trick.")
                            return;
                        }
                    }
                })
            })
        })
    })
}

function set(req, res) {
    var data = {}
    var queryer = req.session

    database.connect(res, function () {
        // indicate that setter has tried
        qry = `UPDATE session_members SET tried = '1' WHERE user_id = '${queryer.user_id}'`
        database.query(res, qry, function (result) {

            // if setter succeeded
            if (req.body.success == 1) {
                msg = "Nice! Waiting for others to attempt your set."
                comm.send(res, 200, data, msg)
            }

            // if setter failed
            if (req.body.success == 0) {
                msg = "Nice try."
                next_set(req, res, data, msg)
            }
        })
    })
}

function defend(req, res) {

    var data = {}
    var msg = ""
    var queryer = req.session

    database.connect(res, function () {

        qry = `UPDATE session_members SET tried = '1' WHERE user_id = '${queryer.user_id}'`
        database.query(res, qry, function (result) {
                // if defender succeeded
            if (req.body.success == 1) {
                msg = "Nice! Waiting for others to finish the set."
                qry = `UPDATE session_members SET do_over = 0 WHERE user_id = '${queryer.user_id}' AND do_over = 1;`
                database.query(res, qry, function (result) {
                    if (result.affectedRows == 1) {
                        msg += "\nWhatch out! You're hanging by a thread."
                    }
                    next_round(req, res, data, msg)
                })
            }
            // if defender failed
            if (req.body.success == 0) {

                // if num_strikes == max_strikes - 1
                qry = `SELECT @qry := (SELECT num_strikes FROM session_members WHERE user_id = '${queryer.user_id}') = (SELECT max_strikes FROM game_sessions WHERE session_id = '${req.body.session_id}') - 1; SELECT @qry;`
                database.query(res, qry, function (result) {
                    if (result[1][0]["@qry"] == 1) {
                        qry = `SELECT do_over FROM session_members WHERE user_id = '${queryer.user_id}'`
                        database.query(res, qry, function (result) {

                            // if do-over is 0, let them try again (ie. no try recorded)
                            if (result[0].do_over == 0) {
                                qry = `UPDATE session_members SET do_over = 1 WHERE user_id = '${queryer.user_id}'; UPDATE session_members SET tried = 0 WHERE user_id = '${queryer.user_id}';`
                                database.query(res, qry, function (result) {
                                    msg = "You're on your last try, good luck."
                                    next_round(req, res, data, msg)
                                })
                            }

                            // if do-over is 1, they have lost.
                            if (result[0].do_over == 1) {
                                // set user as lost
                                qry = `UPDATE session_members SET lost = 1 WHERE user_id = '${queryer.user_id}';`
                                database.query(res, qry, function (result) {
                                    msg = "YOU LOST"

                                    // check if game is over
                                    qry = `select * from session_members where session_id = '${req.body.session_id}' and lost = 0;`
                                    database.query(res, qry, function (result) {
                                        if (result.length == 1) {
                                            msg += `\nGAME OVER\nWinner = ${result[0].user_id}!`
                                            Wrap_Up_Game(req, res, msg)
                                            return;
                                        }
                                        next_round(req, res, data, msg)
                                    })
                                })
                            }
                        })
                    }

                    // not on last try
                    if (result[1][0]["@qry"] == 0) {
                        qry = `UPDATE session_members SET num_strikes = num_strikes + 1 WHERE user_id = '${queryer.user_id}'; SELECT num_strikes FROM session_members WHERE user_id = '${queryer.user_id}';`
                        database.query(res, qry, function (result) {
                            msg = `You have ${result[1][0].num_strikes} strikes!`
                            next_round(req, res, data, msg)
                        })
                    }
                })
            }
        }) 
    })
}

exports.request = request
exports.set = set
exports.defend = defend

function next_set(req, res, data, msg) {
    // if setter failed, update so no one has tried and increment setter
    qry = `UPDATE session_members SET tried = 0 WHERE session_id = '${req.body.session_id}' AND lost = 0; CALL find_next_setter('${req.body.session_id}');`
    database.query(res, qry, function (result) {
        msg += "\nNext set starting, waiting for Setter to set."
        comm.send(res, 200, data, msg)
        return;
    })
}

function next_round(req, res, data, msg) {

    qry = `select @qry := (select count(*) from session_members where session_id = '${req.body.session_id}' and lost = 0) = (select count(*) from session_members where session_id = '${req.body.session_id}' and tried = 1 and lost = 0); select @qry;`
    database.query(res, qry, function (result) {
        if (result[1][0]['@qry'] == 0) {
            comm.send(res, 200, data, msg)
            return;
        }
        if (result[1][0]['@qry'] == 1) {
            qry = `UPDATE session_members SET tried = 0 WHERE session_id = '${req.body.session_id}' AND lost = 0;`
            database.query(res, qry, function (result) {
                msg += "\nNext round starting, waiting for Setter to set."
                comm.send(res, 200, data, msg)
                return;
            })
        }
    })
}

function Wrap_Up_Game(req, res, msg) {
    var data = {}
    qry = `DELETE FROM game_sessions WHERE session_id = '${req.body.session_id}'; DELETE FROM session_members WHERE session_id = '${req.body.session_id}';`
    database.query(res, qry, function(result) {
        comm.send(res, 200, data, msg)
        return;
    })
}