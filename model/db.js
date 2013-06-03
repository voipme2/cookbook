/**
 * db.js - initial cut of the model classes used for the cookbook
 */ 
 
var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/cookbook' );

// TODO - should measure come from a pre-populated list?
var Ingredient = new mongoose.Schema({
  name: String,       // ingredient name
  measure: String,    // tbsp, tsp, pinch
  amount: Number      
});

// TODO - do we want to indicate which ingredients are used in this step?
var CookingStep = new mongoose.Schema({
  time: Number,
  directions: String,
  imageUrl: String
});

var RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    version: Number,
    imageUrl: String,
    prepTime: { type: Number, min: 0 },
    cookTime: { type: Number, min: 0 },
    tags: [String],
    ingredients: [Ingredient], 
    steps: [CookingStep],
    copyright: { holder: String, date: Date }
});

// create the Recipe collection
var Recipe = mongoose.model( 'Recipe', RecipeSchema );
