const fs = require("fs");
const path = require("path");

// Controller for handling recipe image uploads
const uploadRecipeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the file path relative to the uploads directory
    const relativePath = path
      .relative(path.join(__dirname, "../../uploads"), req.file.path)
      .replace(/\\/g, "/"); // Replace backslashes with forward slashes for web URLs

    // Use the API path to serve images
    const publicPath = "/api/images/serve/" + relativePath;

    // Return success response with file details
    res.status(200).json({
      success: true,
      image: {
        filename: req.file.filename,
        path: publicPath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res
      .status(500)
      .json({ message: "Failed to upload image", error: error.message });
  }
};

// Serve images through the API
const serveImage = (req, res) => {
  try {
    // Construct the file path from the request params
    const filePath = path.join(
      __dirname,
      "../../uploads/recipes",
      req.params.filename,
    );

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving image:", error);
    res
      .status(500)
      .json({ message: "Failed to serve image", error: error.message });
  }
};

// Controller for handling temp image uploads before recipe creation
const uploadTempImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Save to a temp directory (e.g., uploads/temp)
    const relativePath = path
      .relative(path.join(__dirname, "../../uploads"), req.file.path)
      .replace(/\\/g, "/");
    const publicPath = "/api/images/serve/" + relativePath;
    res.status(200).json({
      success: true,
      image: {
        filename: req.file.filename,
        path: publicPath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Error uploading temp image:", error);
    res
      .status(500)
      .json({ message: "Failed to upload temp image", error: error.message });
  }
};

// Utility to move a temp image to a recipe image
const moveTempImageToRecipe = (tempFilename, recipeId) => {
  const tempDir = path.join(__dirname, "../../uploads/temp");
  const recipesDir = path.join(__dirname, "../../uploads/recipes");
  if (!fs.existsSync(recipesDir)) {
    fs.mkdirSync(recipesDir, { recursive: true });
  }
  const tempPath = path.join(tempDir, tempFilename);
  const recipePath = path.join(recipesDir, `${recipeId}.jpg`);
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, recipePath);
    return recipePath;
  }
  return null;
};

module.exports = {
  uploadRecipeImage,~
  serveImage,
  uploadTempImage,
  moveTempImageToRecipe,
};
