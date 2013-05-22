
/*
 * GET home page.
 */

var recipes = require('../model/recipes');

exports.index = function(req, res){
 var sample = "Super Garlic Bread";
 recipes.recipelist(sample, function(err, rlist) {
  res.render('index', {
   title: 'cookbook',
   pagetitle: 'Hello there',
   group: strGroup,
   teams: teamlist
  });
 });
};

