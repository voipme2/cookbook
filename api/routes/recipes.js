const express = require('express');
const {duration} = require('moment');
require('moment-duration-format');

const scraper = require('./scraper');
let db;
let router = new express.Router();

module.exports = function (database) {
  db = database;
  return router;
};

router.get('/recipes', async function (req, res) {
  const recipes = await db.list();
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(recipes));
});

router.get('/recipes/:recipeId', async function (req, res) {
  const recipe = await db.find(req.params.recipeId);
  let totalTime = 0;
  ['prepTime', 'inactiveTime', 'cookTime'].forEach(function (t) {
    recipe[t] = recipe[t] || 0;
    totalTime += recipe[t];
    recipe[t] = duration(recipe[t], "minutes").format("d [d] h [hr] m [min]");
  });

  recipe.totalTime = duration(totalTime, "minutes").format("d [d] h [hr] m [min]");

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(recipe));
});

router.post("/recipes", async function (req, res) {
  const newRecipe = req.body;
  const recipeId = await db.save(newRecipe);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({id: recipeId}));
});

router.post('/recipes/:recipeId', async function (req, res) {
  const recipeId = req.params.recipeId;
  const newRecipe = req.body;
  newRecipe.id = recipeId;
  await db.save(newRecipe);

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({id: recipeId}));
});

router.delete("/recipes/:recipeId", async function (req, res) {
  await db.remove(req.params.recipeId);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({success: true}));
});

router.get("/search", async function (req, res) {
  const search = req.query.query;
  const results = await db.search(search);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(results));
});

router.get("/fetch", async function (req, res) {
  const recipeUrl = req.query.recipeUrl;
  console.log(new Date(), "[ fetch ]", recipeUrl);
  const ret = await scraper.fetch(recipeUrl);
  if (ret) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(ret));
  } else {
    res.status(404).send('Not found');
  }
});
