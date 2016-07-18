var express = require('express');
var router = new express.Router();

var db;

module.exports = function (database) {
    db = database;
    return router;
};

router.get('/', function(req, res) {
    var recipes = db.list();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(recipes));
});

router.get('/:recipeId', function (req, res) {
    var recipeId = parseInt(req.params.recipeId);

    var recipe = getRecipe(recipeId);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(recipe));
});

router.post("/", function(req, res) {
   var newRecipe = req.body;
    var recipeId = saveRecipe(newRecipe);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({id: recipeId}));
});

router.put('/:recipeId', function (req, res) {
    var recipeId = req.params.recipeId;
    var newRecipe = req.body;

    saveRecipe(recipeId, newRecipe);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({success: true}));
});

router.delete("/:recipeId", function(req, res) {
    var recipeId = req.params.recipeId;

    removeRecipe(recipeId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({success: true}));
});

function saveRecipe(recipe) {
    db.save(recipe);
}

function getRecipe(id) {
    return db.find(id);
}

function removeRecipe(id) {
    db.remove(id);
}