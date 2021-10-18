

module.exports.logRequest = function (req, res, next) {
  console.log(req)
  console.log("\n\n\n\n\n\n\n\n\n")
  next()
}