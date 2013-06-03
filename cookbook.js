/**
 * Module dependencies.
 */

var express = require('express')
  , db = require('./model/db')
  , main = require('./routes/main')
  , recipe = require('./model/recipes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// pages that get rendered 
app.get('/', main.index);
app.get('/recipes', main.recipes);

// REST configuration
app.get('/api/recipes', recipe.findRecipes);
app.get('/api/recipes/:id', recipe.findById);
app.post('/api/recipes', recipe.addRecipe);
app.put('/api/recipes/:id', recipe.updateRecipe);
app.delete('/api/recipes/:id', recipe.deleteRecipe);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Start cooking!  Go to http://localhost:" + app.get('port') + " and start working!");
});