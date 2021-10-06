const jwt = require('jsonwebtoken');

module.exports.authorize = function (req, res, next) {
  //exceptional routes
  const routes = ['/', '/signup', '/login']
  if (routes.includes(req.url)) {
    console.log(req)
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