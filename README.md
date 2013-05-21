# cookbook

## Overview

Searching through a binder full of printed recipes is a chore.  I want to make it easier to find what you’re looking for, and start cooking.

I decided to put together this so I gather all of the thoughts I have in terms of the overall design.  The functionality is where a lot of the nice features are at, as well as some technical crap too.  All of the technologies that I’ve listed are options as of right now. As we get closer to figuring out how exactly the app should operate, I’ll add/remove stuff as necessary.

## Functionality

Order is important in terms of functionality.

As a user, I need to be able to:

1. Easily find the recipe I’m looking for, whether it be by name, or by any other sort of keyword.
1. View the recipe in an easy-to-read format.
1. Change any part of a recipe, if need be.
1. Add a new recipe either through uploading, providing a URL, or by typing one in, via an easy-to-use interface.
1. List a subset of the recipes in a concise and informative manner.
1. Add a note to a recipe that is not necessarily part of the recipe, but is something to keep in mind.
1. View a sub-recipe through an easy-to-use interface, without taking me away from the recipe I’m making.
1. Remove any content that I’ve added.

As an admin, I need to be able to:

1. Add or remove users.
1. Add or remove content.
1. Roll back recipes to a previous version

## Technologies

Here’s a list of proposed technologies that I’m thinking about for the server side.  The guiding principle here is going to making the server more or less interface agnostic.  When it comes time to turn this into an Android/iOS app (if ever), using the REST API should be pretty trivial.

### Server

* Node.js + Express (JS) - http://nodejs.org/, http://expressjs.com/
* Django (Python) - http://www.djangoproject.com/
* Pylons (Python) - http://www.pylonsproject.com/

### Database

* MongoDB (NoSQL) - http://mongodb.org/
* CouchDB (NoSQL) - http://couchdb.apache.org/
* Redis - http://redis.io/ 

### Frontend (web)

* Backbone.js (JS) - http://backbonejs.org/
* Bootstrap (CSS + JS) - http://twitter.github.com/bootstrap/
* Stylus (CSS) - http://learnboost.github.com/stylus/ 

## Database Design

Below are the objects that would end up being created if we’re using a NoSQL type database.  Otherwise, we’d have to reconsider how we structure the schema.

```
class Recipe {
   String name;
   String imageUrl;
   int prepTime;
   int cookTime;
   List<String> tags;
   List<Ingredient> ingredients;
   List<Note> notes;
   List<RecipeStep> steps;
   List<Recipe> subRecipes;
   CopyRight copyright;
}

class Ingredient {
   String name;
   String measure;
   Double amount;
}

class Note {
   String author;
   String message;
}

class RecipeStep {
   String directions;
   String imageUrl;
}

class CopyRight {
   String holder;
   Date date;
}
```

## REST API

This documents the REST API - which will be pretty simple.  I think we’re going to need to implement some sort of authentication, so the service doesn’t get spammed.  

Formats supported will initially be JSON and XML.

### GET /recipe

Returns a list of all the recipes.

### GET /recipe/:id

Return the recipe specified by the ID.

### POST /recipe

Creates a new recipe.

### PUT /recipe/:id

Updates or creates a recipe.

### DELETE /recipe/:id

Deletes the recipe with the specified ID.
