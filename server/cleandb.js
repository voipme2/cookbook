var db = require('./cookbookdb');

const DB_FILE = "./recipes.json";

var fs = require('fs');
var recipes = require(DB_FILE);
// console.log(recipes.map(function(u) { return u.id; }));

var updated = [];
recipes.forEach(function(r,i) {
    r.id = db.getId(r.name);
    updated.push(r);
 });

// console.log(updated.map(function(u) { return u.id; }));

fs.writeFileSync("recipes.json", JSON.stringify(updated));