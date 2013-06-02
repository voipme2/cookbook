/**
 * recipes.js
 *
 * This provides all REST functions used by the app.  Obviously need a bit of work.
 * 
 * Thanks to https://github.com/ccoenraets/nodecellar for the REST interface framework.
 * Also thanks to https://gist.github.com/pixelhandler/1791080.
 */

var mongoose = require( 'mongoose' ),
    Recipe = mongoose.model('Recipe');
 
/**
 * Lists all of the recipes, or if query params are supplied,
 * performs a search.
 */
exports.findRecipes = function(req, res) {
	var q = {};
	if (req.query && req.query.search) {
		var search = new RegExp(req.query.search, "ig");
		q = {
			$or: [
				{ name: search }
			]
		};
	}
	return Recipe.find(q, function (err, recipes) {
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


/**
 * This function searches the database.  Not sure what this is going to render, though.  Most likely JSON.
 */
exports.search = function(req, res) {

};
