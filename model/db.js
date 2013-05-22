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

mongoose.model( 'Recipe', recipeSchema );

mongoose.connect( 'mongodb://localhost/cookbook' );

