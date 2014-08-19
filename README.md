# cookbook

## Overview

Searching through a binder full of printed recipes is a chore.  I want to make it easier to find what you’re looking for, and start cooking.

This app is meant to run as a standalone server (running server.py), which provides both the interface and REST endpoint.  Its written in Python 2.5.6, and should be compatible with later versions of Python.  It uses sqlite3 as its database, since I didn't want a large footprint (its a small NAS).

## Getting started

Just run ``python server.py``, then visit http://localhost:8000/cookbook/ to get started!

That's it!


## REST API

This documents the REST API - which will be pretty simple.  See [the schema file](data/schema.sql) for the ``Recipe`` object.  The ID for a recipe will be a sanitized version of the name, shortened to some character length.  Or something else.

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
