const jwt = require('jsonwebtoken');
const database = require('./database');
const comm = require('./communications')


module.exports.authorize = function (req, res, next) {
  //exceptional routes
  EXCEPTIONAL_ROOTS = ['GET'+'/','POST'+'/signup','POST'+'/login']

  if (EXCEPTIONAL_ROOTS.includes(req.method + req.url)) {
    next()
    return
  }
  jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, data) {
    if (err) {
      return comm.send(res, 401, {}, err)
    }
    req.session = data
    next()
  })
}

module.exports.dispenseToken = function (payload, callback) {
  jwt.sign(payload, process.env.JWT_SECRET, function (err, token) {
    if (err) {
      return comm.send(res, 401, {}, err)
    }
    callback(token)
  })
}
