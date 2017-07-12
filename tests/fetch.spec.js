// test to make sure that we can fetch recipes correctly.
var request = require('request');
var scraper = require('../server/scraper');
describe("scraper tests", function() {
    it("should return a recipe from allrecipes", function (done) {
        scraper.fetchAllRecipes("http://allrecipes.com/recipe/15057/overnight-blueberry-french-toast/",
            function(recipe) {
                expect(recipe.name).toEqual("Overnight Blueberry French Toast");
                expect(recipe.prepTime).toEqual(15);
                expect(recipe.cookTime).toEqual(75);
                done();
            }
        );
    });

    it("should return a recipe from foodnetwork", function(done) {
        scraper.fetchFoodNetwork("http://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840",
            function(recipe) {
                expect(recipe.name).toEqual("Fettuccine with Creamy Red Pepper-Feta Sauce");
                expect(recipe.inactiveTime).toEqual(25);
                expect(recipe.cookTime).toEqual(12);
                done();
            }
        );
    });
});