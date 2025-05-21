const express = require("express");
const cookbookdb = require("./data/cookbookdb");
const recipes = require("./routes/recipes")(cookbookdb);
const imageRoutes = require("./routes/imageRoutes");

// dirt simple express app
let app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});
// Add static file serving for uploaded images
app.use("/api", recipes);
app.use("/api/images", imageRoutes);

const PORT = 3000;
app.listen(PORT, function () {
  console.info(`cookbook is running on port ${PORT}`);
});
