const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const {
  uploadRecipeImage,
  serveImage,
  uploadTempImage,
} = require("../controllers/imageController");

// Route for uploading recipe images
router.post("/recipes", upload.single("image"), uploadRecipeImage);

// Route for uploading temp images before recipe creation
router.post("/temp", upload.single("image"), uploadTempImage);

// Route for serving images through the API
router.get("/serve/recipes/:filename", serveImage);

module.exports = router;
