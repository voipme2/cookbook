/**
 * recipes.js
 *
 * This provides all REST functions used by the app.  Obviously need a bit of work.
 * 
 * Thanks to https://github.com/ccoenraets/nodecellar for the REST interface framework.
 */
 
/**
 * Lists all of the recipes.
 */
exports.listAllRecipes = function(req, res) {

};
  
/**
 * Returns a specific recipe.
 */
exports.findById = function(req, res) {
  var id = req.params.id;
  
};

/**
 * Adds a new recipe.
 */
exports.addRecipe = function(req, res) {
  var recipe = req.body;
};

/**
 * Updates a recipe.
 */
exports.updateRecipe = function(req, res) {
  var id = req.params.id;
  var recipe = req.body;
};
