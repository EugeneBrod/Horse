require('dotenv').config();
const express = require('express');
const login = require('./login');
const friends = require('./friends');
const lobby = require('./lobby');
const database = require('./database');
const game = require('./game');
const auth = require('./auth');
const location = require('./location')



const app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(auth.authorize);
app.use(location.updateLocation);


/*
Consuming JSON requests:
var dict = req.body

Server -> Client Communication:
data = { a:1, b:2}
res.setHeader('Content-Type', 'application/json');
res.end(JSON.stringify(data))
*/



app.get('/', (req, res) => {
  res.send('Welcome to SkateSecrets')
});

app.post('/login', login.login)

app.post('/signup', login.signup);

app.delete('/signup', login.remove_user);



app.get('/search', friends.friend_search);

app.post('/add_friend', friends.add_friend);

app.delete('/remove_friend', friends.remove_friend);

app.post('/set_availability', friends.set_availability);

app.get('/getNearbyUsers', location.getNearbyUsers);

app.post('/game', lobby.create_session);

app.post('/join', lobby.join_session);

app.post('/ready', lobby.set_ready);

app.post('/launch', lobby.launch);

app.get('/game/request', game.request);

app.post('/game/defend', game.defend);

app.post('/game/set', game.set);


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
});
