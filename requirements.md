# Requirements

This document lists off the requirements for the application.  It more or less keeps us from getting off track.

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
