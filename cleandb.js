
const DB_FILE = "recipes.json";

var fs = require('fs');
var recipes = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

recipes.forEach(function(r,i) {
    console.log(i, r.id, r.name);
});

//
// var updated = recipes.filter(function(r,i) {
//     if (i !== 27) {
//         return r;
//     }
// });
//
// fs.writeFileSync("recipes.json", JSON.stringify(updated));