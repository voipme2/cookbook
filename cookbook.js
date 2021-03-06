var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookbookdb = require('./data/cookbookdb');

var recipes = require('./routes/recipes')(cookbookdb);

app.use(bodyParser.json());

app.use('/cookbook/', express.static(__dirname + '/client'));
app.use('/api', recipes);

app.listen(8000, function() {
    console.info("cookbook is running on port 8000");
});