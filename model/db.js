/**
 * db.js - initial cut of the model classes used for the cookbook
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
        amount: String      // 1, 1/2, 1/4
    }], 
    notes: [{
        author: String,
        message: String,
        date: Date,
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

mongoose.model( 'Recipe', recipeSchema );

mongoose.connect( 'mongodb://localhost/cookbook' );

