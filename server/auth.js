const jwt = require('jsonwebtoken');

module.exports.authorize = function (req, res, next) {
  //exceptional routes
  const routes = ['GET'+'/','POST'+'/signup','POST'+'/login']
  if (routes.includes(req.method+req.url)) {
    next()
    return
  }
  jwt.verify(req.body.token, process.env.JWT_SECRET, function (err, data) {
      if (err) {
          return res.status(401).send(err);
      }
      req.session = data
      next()
  })
}

module.exports.dispenseToken = function (payload, callback) {
  jwt.sign(payload, process.env.JWT_SECRET, function (err, token) {
    if (err) {
        return res.status(400).send(err);
    }
    callback(token)
  })
}
