var db = require('./data/cookbookdb');

const DB_FILE = "./data/recipes.json";

var fs = require('fs');
var recipes = require(DB_FILE);
// console.log(recipes.map(function(u) { return u.id; }));

let foundPC = false;
var updated = [];
recipes.forEach(function(r,i) {
    r.id = db.getId(r.name);
    if (r.id === "pumpkin_cheesecake") {

        if (!foundPC) {
            foundPC = true;
            updated.push(r);
        }
    } else {
        updated.push(r);
    }
 });

//console.log(updated.map(function(u) { return u.id; }));

fs.writeFileSync(DB_FILE, JSON.stringify(updated));