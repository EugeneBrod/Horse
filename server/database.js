const mysql = require('mysql2');
const comm = require('./communications')



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
            return comm.send(res, 400, {}, "Error connecting to database.")
        }
        callback()
    })
}


function query(res, qry, callback) {
    con.query(qry, function (err, result) {
        if (err) {
            return comm.send(res, 500, {}, "Error querying the database.")
        }
        callback(result)
    })
}

exports.connect = connect
exports.query = query