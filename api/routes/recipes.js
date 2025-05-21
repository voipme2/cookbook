const express = require("express");

const recipesController = require("../controllers/recipesController");
let db;
let router = new express.Router();

module.exports = function (database) {
  db = database;
  // List recipes
  router.get("/recipes", (req, res) => recipesController.list(req, res, db));
  // Get a recipe
  router.get("/recipes/:recipeId", (req, res) =>
    recipesController.get(req, res, db),
  );
  // Create a recipe
  router.post("/recipes", (req, res) => recipesController.create(req, res, db));
  // Update a recipe
  router.post("/recipes/:recipeId", (req, res) =>
    recipesController.update(req, res, db),
  );
  // Upload an image for a recipe
  router.post("/recipes/:recipeId/image", (req, res) =>
    recipesController.uploadImage(req, res, db),
  );
  // Fetch a recipe from a URL using the scraper
  router.post("/recipes/fetch", (req, res) =>
    recipesController.fetchFromUrl(req, res),
  );
  return router;
};
