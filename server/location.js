const database = require('./database')

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