// test to make sure that we can fetch recipes correctly.
var request = require('request');
var scraper = require('../server/scraper');
describe("scraper tests", function() {
  it("should return overnight blueberry french toast from allrecipes", function (done) {
    scraper.fetchAllRecipes("http://allrecipes.com/recipe/15057/overnight-blueberry-french-toast/",
      function (recipe) {
        expect(recipe.name).toEqual("Overnight Blueberry French Toast");
        expect(recipe.prepTime).toEqual("15 min");
        expect(recipe.cookTime).toEqual("75 min");
        done();
      }
    );
  });

  it("should return fettucine with creamy red pepper  from foodnetwork", function (done) {
    scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840",
      function (recipe) {
        expect(recipe.name).toEqual("Fettuccine with Creamy Red Pepper-Feta Sauce");
        expect(recipe.prepTime).toEqual("12 min");
        expect(recipe.cookTime).toEqual("25 min");
        done();
      }
    );
  });

  it("should return orecchiette with pancetta pumpkin from foodnetwork", function (done) {
    scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/anne-burrell/orecchiette-with-pancetta-pumpkin-and-broccoli-rabe-3568201",
      function (recipe) {
        expect(recipe.name).toEqual("Orecchiette with Pancetta, Pumpkin and Broccoli Rabe");
        expect(recipe.inactiveTime).toEqual("35 min");
        expect(recipe.cookTime).toEqual("25 min");
        done();
      }
    );
  });

  it("should return veggie lovers club sandwich k with no cooktime", function (done) {
    scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/food-network-kitchen/veggie-lovers-club-sandwich-recipe-2120987",
      function (recipe) {
        expect(recipe.name).toEqual("Veggie Lover's Club Sandwich");
        expect(recipe.cookTime).toBeUndefined();
        expect(recipe.prepTime).toEqual("30 min");
        done();
      }
    );
  });
  it("should return marinara sauce from foodnetwork with steps", function (done) {
    scraper.fetchFoodNetwork("https://www.foodnetwork.com/recipes/giada-de-laurentiis/marinara-sauce-recipe-2103577",
      function (recipe) {
        expect(recipe.name).toEqual("Marinara Sauce");
        expect(recipe.cookTime).toEqual("70 min");
        expect(recipe.prepTime).toEqual("10 min");
        done();
      }
    );
  });
  it("should handle a foodnetwork recipe without an author", function (done) {
    scraper.fetchFoodNetwork("https://www.foodnetwork.com/recipes/food-network-kitchen/zucchini-corn-fritters-recipe-1973756",
      function (recipe) {
        expect(recipe.name).toEqual("Zucchini-Corn Fritters");
        expect(recipe.author).toEqual("Food Network Kitchen");
        expect(recipe.steps[0].text).toEqual("Toss the zucchini with 1/2 teaspoon salt in a bowl; let stand 10 minutes. Wrap the zucchini in a kitchen towel and squeeze dry.");
        done();
      }
    );
  });
});
