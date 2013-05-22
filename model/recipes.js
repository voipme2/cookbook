/**
 * Not ready yet
 */

var mongoose = require('mongoose');

exports.recipelist = function recipelist(name, callback) {
    var Recipe = mongoose.model( 'Recipe' );
    Recipe.find({'name': name}, function (err, recipes) {
        if (err) {
            console.log(err);
        } else {
            console.log(recipes);
            callback("", recipes);
        }
    });
}
