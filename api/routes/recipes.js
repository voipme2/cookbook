const express = require("express");

const scraper = require("./scraper");
let db;
let router = new express.Router();

module.exports = function (database) {
  db = database;
  return router;
};

router.get("/recipes", async function (req, res) {
  const recipes = await db.list();
  res.send(JSON.stringify(recipes));
});

router.get("/recipes/:recipeId", async function (req, res) {
  const recipe = await db.find(req.params.recipeId);
  recipe.id = req.params.recipeId;

  res.send(JSON.stringify(recipe));
});

router.post("/recipes", async function (req, res) {
  const newRecipe = req.body;
  const recipeId = await db.save(newRecipe);

  res.send(JSON.stringify({ id: recipeId }));
});

router.post("/recipes/:recipeId", async function (req, res) {
  const recipeId = req.params.recipeId;
  const newRecipe = req.body;
  newRecipe.id = recipeId;

  await db.save(newRecipe);

  res.send(JSON.stringify({ id: recipeId }));
});

router.post("/recipes/:recipeId/image", async function (req, res) {
  const recipeId = req.params.recipeId;
  const image = req.body.image;

  const recipe = await db.find(recipeId);
  // if we find a recipe, write the image to a file and then update the recipe.imageUrl property
  if (recipe) {
    await db.saveImage(recipeId, image);
    res.send(JSON.stringify({ imageUrl: recipe.imageUrl }));
  } else {
    res.status(404).send("Not found");
  }
});

router.delete("/recipes/:recipeId", async function (req, res) {
  await db.remove(req.params.recipeId);
  res.send(JSON.stringify({ success: true }));
});

router.get("/search", async function (req, res) {
  const search = req.query.query.trim();
  const sanitizedSearch = search.replace(/[^\w\s]|_/g, ""); // Remove only non-alphanumeric characters, but leave spaces
  const results = await db.search(sanitizedSearch);
  res.send(JSON.stringify(results));
});

router.get("/fetch", async function (req, res) {
  const recipeUrl = req.query.recipeUrl;
  console.log(new Date(), "[ fetch ]", recipeUrl);
  try {
    const ret = await scraper.fetch(recipeUrl);
    if (ret) {
      res.send(JSON.stringify(ret));
    } else {
      res.status(404).send("Not found");
    }
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: e }));
  }
});
