function send (res, status, data, message) {
    data.message = message
    res.setHeader('Content-Type', 'application/json');
    res.status(status).end(JSON.stringify(data))
}

exports.send = send