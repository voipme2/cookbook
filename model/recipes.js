/**
 * recipes.js
 *
 * This provides all REST functions used by the app.  Obviously need a bit of work.
 * 
 * Thanks to https://github.com/ccoenraets/nodecellar for the REST interface framework.
 * Also thanks to https://gist.github.com/pixelhandler/1791080.
 */

var mongoose = require( 'mongoose' );
 
var recipeSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    prepTime: Number,
    cookTime: Number,
    tags: [String],
    ingredients: [{
        name: String,       // ingredient name
        measure: String,    // tbsp, tsp, pinch
        amount: Number      
    }], 
    notes: [{
        author: String,
        message: String
    }],
    steps: [{
        directions: String,
        imageUrl: String
    }],
    copyright: {
        holder: String,
        date: Date
    }
});

var Recipe = mongoose.model( 'Recipe', recipeSchema );
 
/**
 * Lists all of the recipes.
 */
exports.listAllRecipes = function(req, res) {
	return Recipe.find(function (err, recipes) {
		if (!err) {
			return res.send(recipes);
		} else {
			return console.log(err);
		}
	});
};
  
/**
 * Returns a specific recipe.
 */
exports.findById = function(req, res) {
	return Recipe.findById(req.params.id, function (err, recipe) {
		if (!err) {
			return res.send(recipe);
		} else {
			return console.log(err);
		}
	});
};

/**
 * Adds a new recipe.
 */
exports.addRecipe = function(req, res) {
	var recipe;
	console.log("POST: ");
	console.log(req.body);
	recipe = new Recipe({
		name: req.body.name
	});
	recipe.save(function (err) {
		if (!err) {
			return console.log("created");
		} else {
			return console.log(err);
		}
	});
	return res.send(recipe);
};

/**
 * Updates a recipe.
 */
exports.updateRecipe = function(req, res) {
	return Recipe.findById(req.params.id, function (err, recipe) {
		recipe.name = req.body.name;
		return recipe.save(function (err) {
			if (!err) {
				console.log("updated");
			} else {
				console.log(err);
			}
			return res.send(recipe);
		});
	});
};

/**
 * Deletes a recipe.
 */
exports.deleteRecipe = function(req, res) {
	return Recipe.findById(req.params.id, function (err, recipe) {
		return recipe.remove(function (err) {
			if (!err) {
				console.log("removed");
				return res.send('');
			} else {
				console.log(err);
			}
		});
	});
};
