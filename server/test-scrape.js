var scraper = require('./scraper');

scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/tyler-florence/macaroni-and-cheese-recipe",
function (recipe) {
    console.log(recipe);
},
function (err) {
    console.error(err);
})