const express = require('express');
const bodyParser = require('body-parser');
const cookbookdb = require('./server/data/cookbookdb');
const recipes = require('./server/routes/recipes')(cookbookdb);

// dirt simple express app
let app = express();
app.use(bodyParser.json());
app.use('/cookbook/', express.static(__dirname + '/dist'));
app.use('/api', recipes);

app.listen(8000, function () {
  console.info("cookbook is running on port 8000");
});
