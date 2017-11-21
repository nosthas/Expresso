const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 4000;

const api = require('./api/api');

app.use(express.static('public'));
app.use(bodyParser.json());

// API Router
app.use('/api', api);

app.listen(PORT, () => {
  console.log("API running on port: " + PORT);
});

module.exports = app;
