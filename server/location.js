const database = require('./database')
const haversine = require('haversine')
const comm = require('./communications')

/*
Middleware that tracks the location of every authenticated user. A user is authenticated
when the request has a req.session attribute.
*/

function updateLocation(req, res, next) {
  console.log("got into updateLocation")
  if (req.session) {
    qry = `UPDATE users SET lat = ${req.body.lat}, lon = ${req.body.lon} WHERE username = '${req.session.username}';`
    database.connect(res, function() {
      database.query(res, qry, function (result) {
      })
    })
  }
  next()
}

function getNearbyUsers (req, res) {
  /*
  required params:
    req.body.lat
    req.body.lon
    req.body.searchRadius
  */
  console.log("got into getNearbyUsers")
  const availability = true
  qry = `SELECT * FROM users WHERE available = ${availability};`
  database.connect(res, function() {
    database.query(res, qry, function (result) {
      var searchResults = []
      Object.keys(result).forEach( function(key) {
        start = {
          'latitude': req.body.lat,
          'longitude': req.body.lon
        }
        end = {
          'latitude': result[key].lat,
          'longitude': result[key].lon
        }
        if (haversine(start, end, {unit: 'mile'}) < req.body.searchRadius) {
          var dict = {
          "user_id": result[key].user_id,
          "username": result[key].username,
          "stance": result[key].stance,
          "rep": result[key].rep
        }
        searchResults.push(dict)
        }
      })
      data = {'searchResults': searchResults}
      comm.send(res, 200, data, 'Successfully retrieved nearby users that are available')
    })
  })
}

exports.getNearbyUsers = getNearbyUsers
exports.updateLocation = updateLocation