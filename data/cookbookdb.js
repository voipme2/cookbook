// testing
const path = require('path');
const DB_FILE = path.resolve(__dirname + "/recipes.json");

var fs = require('fs');
var tryRequire = require('try-require');
var recipes = tryRequire(DB_FILE);

if (!recipes) {
    recipes = [];
}

function idList() {
    return recipes.map(function(r) { return r.id; });
}

function getId(name) {
    return name.toLowerCase()
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, "_");
}

function findIndex(id) {
    var ids = idList();
    return ids.indexOf(id);
}

module.exports = {
    find: function (id) {
        var ind = findIndex(id);
        if (ind !== -1) {
            return recipes[ind];
        }
    },

    list: function() {
        return recipes.map(function(r) { 
            return { 
                id: r.id, 
                name: r.name, 
                description: r.description,
                options: r.options
             }; 
        });
    },

    save: function(recipe) {

        if (!recipe.id) {
            recipe.id = getId(recipe.name);
        } 
        
        var index = findIndex(recipe.id);
        if (index === -1) {
            index = recipes.length;
        }
        recipes.splice(index, 1, recipe);

        fs.writeFileSync(DB_FILE, JSON.stringify(recipes));
        return recipe.id;
    },

    remove: function(id) {
        var ind = findIndex(id);
        if (ind !== -1) {
            recipes.splice(ind, 1);
            fs.writeFileSync(DB_FILE, JSON.stringify(recipes));
        }
    },
    search: function(search) {
        var re = new RegExp(search, "i");
        var found = recipes.filter(function (r) {
            return r.name.match(re) || r.author.match(re) || r.ingredients.some(function (i) {
                return i.text.match(re);
            });
        });
        return found.map(function(r) { return { id: r.id, name: r.name }; });
    },
    getId: getId
};