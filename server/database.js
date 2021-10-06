const mysql = require('mysql2');


const con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DATABASE,
	multipleStatements: true
  });

exports.con = con;

function connect(res, callback) {
    con.connect(function (err) {
        if (err) {
            res.status(400).send("Error connecting to database.")
            throw err
        }
        callback()
    })
}


function query(res, qry, callback) {
    con.query(qry, function (err, result) {
        if (err) {
            res.status(500).send("Error querying to database.");
            throw err
        }
        callback(result)
    })
}

exports.connect = connect
exports.query = query