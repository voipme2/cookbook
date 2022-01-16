const fs = require('fs');
const http = require('http');
const recipes = JSON.parse(fs.readFileSync('newrecipes.json', 'utf-8'));

recipes.forEach(recipe => {
  delete recipe.id;
  ["cookTime","inactiveTime", "prepTime"].forEach(t => {
    if (recipe[t]) {
      let num = recipe[t];
      if (typeof recipe[t] === "string" && recipe[t].indexOf('min') !== -1) {
        num = num.match(/\d+/)[0];
      }
      recipe[t] = num * 60 * 1000;
    }
  });

  let jsonRecipe = JSON.stringify(recipe);
  console.log(jsonRecipe);
  let options = {
    hostname: '192.168.1.8',
    port: 8000,
    path: '/api/recipes',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(jsonRecipe)
    }
  };

  const req = http.request(options, res => {
    res.on('data', d => process.stdout.write(d))
  });

  req.on('error', e => {
    console.error(recipe.name)
    // console.error(e)
  });
  req.write(jsonRecipe);
  req.end();
});
// console.log(recipes[0]);
