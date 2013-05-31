# cookbook

## Overview

Searching through a binder full of printed recipes is a chore.  I want to make it easier to find what you’re looking for, and start cooking.

The app itself is a Node.js app, running with Express (for the HTTP side) and Mongoose (for the database side).  We're using MongoDB on the backend, since that's the one I'm most familiar with.

* Node.js - http://nodejs.org/
* Express - http://expressjs.com/
* Mongoose - http://mongoosejs.com/
* MongoDB - http://www.mongodb.org/

## Getting started

Assuming the clone of your repo is in ``cookbook_repo``

1. Download and install Node.js, and MongoDB.  Follow the guides there to get them running.
1. From your ``cookbook_repo``, run ``npm install`` in order to grab all of the dependencies.
1. Run ``node cookbook``, then browse to http://localhost:3000/

That's it!


## REST API

This documents the REST API - which will be pretty simple.  See [the schema file](model/db.js) for the ``Recipe`` object.  The ID for a recipe will be a sanitized version of the name, shortened to some character length.  Or something else.

Formats supported will initially be JSON and XML.

### GET /api/recipe

Returns a list of all the recipes.

### GET /api/recipe/:id

Return the recipe specified by the ID.

### POST /api/recipe

Creates a new recipe.

### PUT /api/recipe/:id

Updates or creates a recipe.

### DELETE /api/recipe/:id

Deletes the recipe with the specified ID.
