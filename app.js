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

// index, and search pages.  not sure if we need to have the
// main.index, but we'll leave it there for now.
app.get('/', main.index);
app.get('/search', main.search);

// REST configuration
app.get('/recipes', recipe.listAllRecipes);
app.get('/recipes/:id', recipe.findById);
app.post('/recipes', recipe.addRecipe);
app.put('/recipes/:id', recipe.updateRecipe);
app.delete('/recipes/:id', recipe.deleteRecipe);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
