// test to make sure that we can fetch recipes correctly.
const scraper = require("../routes/scraper");
describe("scraper tests", function () {
  it("should return overnight blueberry french toast from allrecipes", async function () {
    const recipe = await scraper.fetch(
      "https://www.allrecipes.com/recipe/15057/overnight-blueberry-french-toast/",
    );
    expect(recipe.name).toEqual("Overnight Blueberry French Toast");
    expect(recipe.ingredients.length).toEqual(12);
    expect(recipe.steps.length).toEqual(8);
    expect(recipe.prepTime).toEqual("15 min");
    expect(recipe.cookTime).toEqual("55 min");
  });

  it("should return fettucine with creamy red pepper from foodnetwork", async function () {
    const recipe = await scraper.fetch(
      "http://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840",
    );
    expect(recipe.name).toEqual("Fettuccine with Creamy Red Pepper-Feta Sauce");
    expect(recipe.ingredients.length).toEqual(10);
    expect(recipe.steps.length).toEqual(1);
    expect(recipe.prepTime).toEqual("12 min");
    expect(recipe.cookTime).toEqual("25 min");
  });

  it("should return sonoran-style potato soup recipe from epicurious", async function () {
    const recipe = await scraper.fetch(
      "https://www.epicurious.com/recipes/food/views/sonoran-style-potato-cheese-tomato-soup",
    );
    expect(recipe.name).toEqual(
      "Sonoran-Style Potato, Cheese, and Tomato Soup",
    );
    expect(recipe.ingredients.length).toEqual(14);
    expect(recipe.steps.length).toEqual(3);
    expect(recipe.cookTime).toEqual("30 min");
  });

  it("should return orecchiette sausage broccoli recipe from onceuponachef", async function () {
    const recipe = await scraper.fetch(
      "https://www.onceuponachef.com/recipes/orecchiette-sausage-broccoli.html",
    );
    expect(recipe.name).toEqual("Orecchiette with Sausage and Broccoli");
    expect(recipe.ingredients.length).toEqual(10);
    expect(recipe.steps.length).toEqual(5);
    expect(recipe.cookTime).toEqual("0 min");
  });

  it("should return broccoli bolognese orecchiette recipe from bonappetit", async function () {
    const recipe = await scraper.fetch(
      "https://www.bonappetit.com/recipe/broccoli-bolognese-with-orecchiette",
    );
    expect(recipe.name).toEqual("Broccoli Bolognese with Orecchiette");
    expect(recipe.ingredients.length).toEqual(9);
    expect(recipe.steps.length).toEqual(6);
    expect(recipe.cookTime).toBeUndefined();
  });

  it("should return beer battered cod fish and chips recipe from browneyedbaker", async function () {
    const recipe = await scraper.fetch(
      "https://www.browneyedbaker.com/beer-battered-cod-fish-and-chips-recipe/",
    );
    expect(recipe.name).toEqual("Beer Battered Cod");
    expect(recipe.ingredients.length).toEqual(10);
    expect(recipe.steps.length).toEqual(3);
    expect(recipe.cookTime).toEqual("8 min");
  });

  it("should return zucchini goat cheese tart recipe from barefootcontessa", async function () {
    const recipe = await scraper.fetch(
      "https://barefootcontessa.com/recipes/zucchini-goat-cheese-tart",
    );
    expect(recipe.name).toEqual("Zucchini & Goat Cheese Tart | Recipes");
    expect(recipe.ingredients.length).toEqual(10);
    expect(recipe.steps.length).toEqual(3);
    expect(recipe.cookTime).toBeUndefined();
  });

  it("should return mummy meatballs recipe from delish", async function () {
    const recipe = await scraper.fetch(
      "https://www.delish.com/cooking/recipe-ideas/recipes/a55767/mummy-meatballs-recipe/",
    );
    expect(recipe.name).toEqual("Mummy Meatballs");
    expect(recipe.ingredients.length).toEqual(10);
    expect(recipe.steps.length).toEqual(5);
    expect(recipe.cookTime).toEqual("0 min");
  });

  // throws a connection reset???
  // it("should return italain wedding cookies recipe from siciliangirl", async function () {
  //   const recipe = await scraper.fetch("https://siciliangirl.com/2014/12/italian-wedding-cookies/");
  //   expect(recipe.name).toEqual("Mummy Meatballs");
  //   expect(recipe.ingredients.length).toEqual(10);
  //   expect(recipe.steps.length).toEqual(5);
  //   expect(recipe.cookTime).toEqual("0 min");
  // });

  it("should return artichoke and spinach recipe from all recipes", async function () {
    const recipe = await scraper.fetch(
      "https://www.allrecipes.com/recipe/26819/hot-artichoke-and-spinach-dip-ii/",
    );
    expect(recipe.name).toEqual("Hot Spinach Artichoke Dip");
    expect(recipe.ingredients.length).toEqual(11);
    expect(recipe.steps.length).toEqual(5);
    expect(recipe.cookTime).toEqual("25 min");
  });

  it("should return beef empanadas recipe from handletheheat", async function () {
    const recipe = await scraper.fetch(
      "https://handletheheat.com/how-to-make-empanadas/#wprm-recipe-container-26286",
    );
    expect(recipe.name).toEqual("Beef Empanadas");
    expect(recipe.ingredients.length).toEqual(25);
    expect(recipe.steps.length).toEqual(10);
  });

  it("should return oatmeal creme pies from americastestkitchen", async function () {
    const recipe = await scraper.fetch(
      "https://www.americastestkitchen.com/recipes/15131-oatmeal-creme-pies",
    );

    expect(recipe.name).toEqual("Oatmeal Creme Pies");
    expect(recipe.ingredients.length).toEqual(18);
    expect(recipe.steps.length).toEqual(8);
  });
});
