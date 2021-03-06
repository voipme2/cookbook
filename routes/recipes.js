var express = require('express');
var router = new express.Router();
var scraper = require('../server/scraper');
var db;

var parseDuration = require('parse-duration');
var moment = require('moment');
require('moment-duration-format');

function convertToMinutes(timeStr) {
    return moment.duration(parseDuration(timeStr)).asMinutes();
}

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
    var recipe = getRecipe(req.params.recipeId);
    var totalTime = 0;
    ['prepTime', 'inactiveTime', 'cookTime'].forEach(function(t) {
        recipe[t] = recipe[t] || 0;
        totalTime += recipe[t];
        recipe[t] = moment.duration(recipe[t], "minutes").format("d [d] h [hr] m [min]");
    });

    recipe.totalTime = moment.duration(totalTime, "minutes").format("d [d] h [hr] m [min]");

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
    var recipeId = req.params.recipeId;
    var newRecipe = req.body;
    newRecipe.id = recipeId;
    saveRecipe(newRecipe);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({id: recipeId}));
});

router.delete("/recipes/:recipeId", function (req, res) {
    removeRecipe(req.params.recipeId);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({success: true}));
});

router.get("/search", function (req, res) {
    var search = req.query.query;
    var results = searchRecipes(search);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(results));
});

router.get("/fetch", function (req, res) {
    var recipeUrl = req.query.recipeUrl;
    console.log(new Date(), "[ fetch ]", recipeUrl);
    scraper.fetch(recipeUrl, function(result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
    }, function(err) {
        res.status(404).send('Not found');
    });
});

function saveRecipe(recipe) {
    ['prepTime', 'inactiveTime', 'cookTime'].forEach(function(t) {
        if (recipe[t]) {
            recipe[t] = convertToMinutes(recipe[t]);
        }
    });

    // no need to save this
    if (recipe.totalTime) {
        delete recipe.totalTime;
    }

    return db.save(recipe);
}

function getRecipe(id) {
    return Object.assign({}, db.find(id));
}

function removeRecipe(id) {
    db.remove(id);
}

function searchRecipes(search) {
    return db.search(search);
}

// polyfill
if (typeof Object.assign != 'function') {
    Object.assign = function(target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}