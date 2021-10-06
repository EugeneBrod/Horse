const database = require('./database')
const haversine = require('haversine')
const comm = require('./communications')

/*
Middleware that tracks the location of every authenticated user. A user is authenticated
when the request has a req.session attribute.
*/

module.exports.updateLocation = function (req, res, next) {
  if (req.session) {
    qry = `UPDATE users SET lat = ${req.body.lat}, lon = ${req.body.lon} WHERE username = '${req.session.username}';`
    database.connect(res, function() {
      database.query(res, qry, function (result) {
      })
    })
  }
  next()
}

module.exports.getNearbyUsers = function (req, res) {
  const availability = true
  qry = `SELECT * FROM users WHERE available = ${availability};`
  database.connect(res, function() {
    database.query(res, qry, function (result) {
      console.log(result[0].username)
      var search_results = []
      Object.keys(result).forEach( function(key) {
        start = {
          'latitude': 37.69749391706761,
          'longitude': -122.14257994797406
        }
        end = {
          'latitude': result[key].lat,
          'longitude': result[key].lon
        }
        console.log(haversine(start, end, {unit: 'mile'}))
      })
        /*
        if (haversine(start, end, {unit: 'mile'})) {

        }
        var dict = {
            "user_id": result[key].user_id,
            "username": result[key].username,
            "stance": result[key].stance,
            "rep": result[key].rep
        }
        search_results.push(dict)
      })
      data = {'search_results': search_results}
      */
      comm.send(res, 200, {}, 'Successfully retrieved nearby users that are available')
    })
  })
}