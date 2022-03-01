// test to make sure that we can fetch recipes correctly.
const scraper = require('../routes/scraper');
describe("scraper tests", function () {
  it("should return overnight blueberry french toast from allrecipes", async function () {
    const recipe = await scraper.fetch("https://www.allrecipes.com/recipe/15057/overnight-blueberry-french-toast/")
    expect(recipe.name).toEqual("Overnight Blueberry French Toast");
    expect(recipe.prepTime).toEqual("15 min");
    expect(recipe.cookTime).toEqual("75 min");
  });

  it("should return fettucine with creamy red pepper from foodnetwork", async function () {
    const recipe = await scraper.fetch("http://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840");
    expect(recipe.name).toEqual("Fettuccine with Creamy Red Pepper-Feta Sauce");
    expect(recipe.prepTime).toEqual("12 min");
    expect(recipe.cookTime).toEqual("25 min");
  });

  it("should return sonoran-style potato soup recipe from epicurious", async function () {
    const recipe = await scraper.fetch("https://www.epicurious.com/recipes/food/views/sonoran-style-potato-cheese-tomato-soup");
    expect(recipe.name).toEqual("Sonoran-Style Potato, Cheese, and Tomato Soup Recipe");
    expect(recipe.cookTime).toEqual("30 min");
  });

  it("should return orecchiette sausage broccoli recipe from onceuponachef", async function () {
    const recipe = await scraper.fetch("https://www.onceuponachef.com/recipes/orecchiette-sausage-broccoli.html");
    expect(recipe.name).toEqual("Orecchiette with Sausage and Broccoli");
    expect(recipe.cookTime).toEqual("0 min");
  });

  it("should return broccoli bolognese orecchiette recipe from bonappetit", async function () {
    const recipe = await scraper.fetch("https://www.bonappetit.com/recipe/broccoli-bolognese-with-orecchiette");
    expect(recipe.name).toEqual("Broccoli Bolognese with Orecchiette");
    expect(recipe.cookTime).toBeUndefined();
  });
});
