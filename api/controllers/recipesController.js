// Controller for recipe-related business logic
const recipesController = {};
const scraper = require("../routes/scraper");

recipesController.list = async (req, res, db) => {
  try {
    const recipes = await db.list();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to list recipes." });
  }
};

recipesController.get = async (req, res, db) => {
  try {
    const recipe = await db.find(req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: "Recipe not found." });
    recipe.id = req.params.recipeId;
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Failed to get recipe." });
  }
};

recipesController.create = async (req, res, db) => {
  try {
    const newRecipe = req.body;
    const recipeId = await db.save(newRecipe);
    res.json({ id: recipeId });
  } catch (err) {
    res.status(500).json({ error: "Failed to create recipe." });
  }
};

recipesController.update = async (req, res, db) => {
  try {
    const recipeId = req.params.recipeId;
    const newRecipe = req.body;
    newRecipe.id = recipeId;
    await db.save(newRecipe);
    res.json({ id: recipeId });
  } catch (err) {
    res.status(500).json({ error: "Failed to update recipe." });
  }
};

recipesController.uploadImage = async (req, res, db) => {
  try {
    const recipeId = req.params.recipeId;
    const image = req.body.image;
    const recipe = await db.find(recipeId);
    if (recipe) {
      await db.saveImage(recipeId, image);
      res.json({ imageUrl: recipe.imageUrl });
    } else {
      res.status(404).json({ error: "Recipe not found." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image." });
  }
};

recipesController.fetchFromUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res.status(400).json({ error: "Missing 'url' in request body." });
    const recipe = await scraper.fetch(url);
    res.json(recipe);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Failed to fetch recipe from URL.",
        details: err.message,
      });
  }
};

module.exports = recipesController;
