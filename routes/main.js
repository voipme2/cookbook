/**
 * main.js
 * 
 * This file serves up the home page, and provides the search functionality
 */

/**
 * Just returns the homepage
 */
exports.index = function(req, res) {
 res.render('index', {
   title: 'cookbook'
  });
};

/**
 * This function searches the database.  Not sure what this is going to render, though.  Most likely JSON.
 */
exports.search = function(req, res) {
 
};

