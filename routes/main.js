/**
 * main.js
 * 
 * This file serves up the home page, and provides the search functionality
 */

var mongoose = require( 'mongoose' ),
    Recipe = mongoose.model('Recipe');
 
/**
 * Just returns the homepage
 */
exports.index = function(req, res) {
 res.render('index', {
   title: 'cookbook'
  });
};

/**
 * Lists all of the recipes on a page.  This is mainly
 * going to be used for testing.
 */
exports.recipes = function(req, res) {
    Recipe.find(function(err, recipes) {
        if (err) {
            console.log(err);
        } else {
            res.render('recipes', {
                title: "Recipe list",
                recipes: recipes
            });
        }
    });
};

