/**
 * db.js - initial cut of the model classes used for the cookbook
 */ 
 
var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/cookbook' );

var RecipeSchema = new mongoose.Schema({
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

// create the Recipe collection
var Recipe = mongoose.model( 'Recipe', RecipeSchema );