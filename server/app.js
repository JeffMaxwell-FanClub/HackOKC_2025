const express = require('express');
const path = require('path')

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'loginSignup.html'));
});

app.get('/user', (req, res) => {
  res.send('');
});

app.get('/admin', (req, res) => {
  res.send('');
});

app.listen(PORT, () => {
    console.log("Server is listening on port 8080");
});