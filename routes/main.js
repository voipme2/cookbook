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
