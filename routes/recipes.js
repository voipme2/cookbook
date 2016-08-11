var express = require('express');
var router = new express.Router();
var Nightmare = require('nightmare');

var db;

module.exports = function (database) {
    db = database;
    return router;
};

router.get('/recipes', function (req, res) {
    var recipes = db.list();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(recipes));
});

router.get('/recipes/:recipeId', function (req, res) {
    var recipeId = parseInt(req.params.recipeId);

    var recipe = getRecipe(recipeId);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(recipe));
});

router.post("/recipes", function (req, res) {
    var newRecipe = req.body;
    var recipeId = saveRecipe(newRecipe);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({id: recipeId}));
});

router.post('/recipes/:recipeId', function (req, res) {
    var recipeId = parseInt(req.params.recipeId);
    var newRecipe = req.body;
    newRecipe.id = recipeId;
    saveRecipe(newRecipe);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({id: recipeId}));
});

router.delete("/recipes/:recipeId", function (req, res) {
    var recipeId = parseInt(req.params.recipeId);

    removeRecipe(recipeId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({success: true}));
});

router.get("/search", function (req, res) {
    var search = req.query.query;
    var results = searchRecipes(search);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
});

router.get("/download", function (req, res) {
    var recipeUrl = req.query.url;
    var nightmare = Nightmare({show: true});
    nightmare.goto(recipeUrl)
        .wait()
        .evaluate(function () {
            return {
                title: document.querySelector("div.title h1").textContent
            };
        })
        .end()
        .then(function (result) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        })
        .catch(function (err) {
            console.error("Unable to get recipe from " + recipeUrl + ":", err);
        })
});

function saveRecipe(recipe) {
    return db.save(recipe);
}

function getRecipe(id) {
    return db.find(id);
}

function removeRecipe(id) {
    db.remove(id);
}

function searchRecipes(search) {
    return db.search(search);
}