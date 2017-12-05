// test to make sure that we can fetch recipes correctly.
var request = require('request');
var scraper = require('../server/scraper');
describe("scraper tests", function() {
    it("should return a recipe from allrecipes", function (done) {
        scraper.fetchAllRecipes("http://allrecipes.com/recipe/15057/overnight-blueberry-french-toast/",
            function(recipe) {
                expect(recipe.name).toEqual("Overnight Blueberry French Toast");
                expect(recipe.prepTime).toEqual("15 min");
                expect(recipe.cookTime).toEqual("75 min");
                done();
            }
        );
    });

    it("should return a recipe from foodnetwork", function(done) {
        scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840",
            function(recipe) {
                expect(recipe.name).toEqual("Fettuccine with Creamy Red Pepper-Feta Sauce");
                expect(recipe.prepTime).toEqual("12 min");
                expect(recipe.cookTime).toEqual("25 min");
                done();
            }
        );
    });

    it("should return a recipe from foodnetwork", function(done) {
        scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/anne-burrell/orecchiette-with-pancetta-pumpkin-and-broccoli-rabe-3568201",
            function(recipe) {
                expect(recipe.name).toEqual("Orecchiette with Pancetta, Pumpkin and Broccoli Rabe");
                expect(recipe.inactiveTime).toEqual("35 min");
                expect(recipe.cookTime).toEqual("25 min");
                done();
            }
        );
    });

    it("should return a recipe from foodnetwork with no cooktime", function(done) {
        scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/food-network-kitchen/veggie-lovers-club-sandwich-recipe-2120987",
            function(recipe) {
                expect(recipe.name).toEqual("Veggie Lover's Club Sandwich");
                expect(recipe.cookTime).toBeUndefined();
                expect(recipe.prepTime).toEqual("30 min");
                done();
            }
        );
    });
});