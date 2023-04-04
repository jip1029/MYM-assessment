const express = require('express');
const mongoose = require('mongoose');
const request = require('request');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

const bcrypt = require('bcrypt');

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

mongoose.connect(
  'mongodb+srv://jip1029:Updown1029@nasaimageappdb.h4indjy.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/', async (req, res) => {
  const saltRounds = 10;
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.send('An error occurred, please try again.');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid username or password');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid username or password');
    }
    req.session.userId = user._id;
    res.redirect('/image');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/image', (req, res) => {
  if (req.session.userId === undefined) {
    return res.redirect('/');
  }
  res.sendFile('image.html', { root: 'public' });
});

app.get('/apod', (req, res) => {
  request.get(
    `https://api.nasa.gov/planetary/apod?api_key=yCKRFFbxslV34hbaEapgM7PupEUgPaqzdbi3WkwJ`,
    (error, response, body) => {
      if (error) {
        console.error(error);
        return;
      }
      const data = JSON.parse(body);
      res.json(data);
    }
  );
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
