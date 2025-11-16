import { describe, it, expect } from "vitest";
import { scraper } from "./scraper";

describe("scraper tests", { timeout: 15000 }, () => {
  it("should return overnight blueberry french toast from allrecipes", async () => {
    const recipe = await scraper.fetch(
      "https://www.allrecipes.com/recipe/15057/overnight-blueberry-french-toast/"
    );

    expect(recipe.name).toBe("Overnight Blueberry French Toast");
    expect(recipe.ingredients.length).toBe(12);
    expect(recipe.steps.length).toBe(8);
    expect(recipe.prepTime).toBe("15 min");
    expect(recipe.cookTime).toBe("55 min");
  });

  it("should return sonoran-style potato soup recipe from epicurious", async () => {
    const recipe = await scraper.fetch(
      "https://www.epicurious.com/recipes/food/views/sonoran-style-potato-cheese-tomato-soup"
    );

    expect(recipe.name).toBe(
      "Sonoran-Style Potato, Cheese, and Tomato Soup"
    );
    expect(recipe.ingredients.length).toBe(14);
    expect(recipe.steps.length).toBe(3);
    expect(recipe.cookTime).toBe("30 min");
  });

  it("should return orecchiette sausage broccoli recipe from onceuponachef", async () => {
    const recipe = await scraper.fetch(
      "https://www.onceuponachef.com/recipes/orecchiette-sausage-broccoli.html"
    );

    expect(recipe.name).toBe("Orecchiette with Sausage and Broccoli");
    expect(recipe.ingredients.length).toBe(10);
    expect(recipe.steps.length).toBe(5);
  });

  it("should return broccoli bolognese orecchiette recipe from bonappetit", async () => {
    const recipe = await scraper.fetch(
      "https://www.bonappetit.com/recipe/broccoli-bolognese-with-orecchiette"
    );

    expect(recipe.name).toBe("Broccoli Bolognese with Orecchiette");
    expect(recipe.ingredients.length).toBe(9);
    expect(recipe.steps.length).toBe(6);
    expect(recipe.cookTime).toBeUndefined();
  });

  it("should return beer battered cod fish and chips recipe from browneyedbaker", async () => {
    const recipe = await scraper.fetch(
      "https://www.browneyedbaker.com/beer-battered-cod-fish-and-chips-recipe/"
    );

    expect(recipe.name).toBe("Beer Battered Cod");
    expect(recipe.ingredients.length).toBe(10);
    expect(recipe.steps.length).toBe(3);
    expect(recipe.cookTime).toBe("8 min");
  });

  it("should return zucchini goat cheese tart recipe from barefootcontessa", async () => {
    const recipe = await scraper.fetch(
      "https://barefootcontessa.com/recipes/zucchini-goat-cheese-tart"
    );

    expect(recipe.name).toContain("Zucchini & Goat Cheese Tart");
    expect(recipe.ingredients.length).toBe(10);
    expect(recipe.steps.length).toBe(3);
  });

  it("should return mummy meatballs recipe from delish", async () => {
    const recipe = await scraper.fetch(
      "https://www.delish.com/cooking/recipe-ideas/recipes/a55767/mummy-meatballs-recipe/"
    );

    expect(recipe.name).toBe("Mummy Meatballs");
    expect(recipe.ingredients.length).toBe(10);
    expect(recipe.steps.length).toBe(5);
  });

  it("should return artichoke and spinach recipe from allrecipes", async () => {
    const recipe = await scraper.fetch(
      "https://www.allrecipes.com/recipe/26819/hot-artichoke-and-spinach-dip-ii/"
    );

    expect(recipe.name).toBe("Hot Spinach Artichoke Dip");
    expect(recipe.ingredients.length).toBe(11);
    expect(recipe.steps.length).toBe(5);
    expect(recipe.cookTime).toBe("25 min");
  });

  it("should return beef empanadas recipe from handletheheat", async () => {
    const recipe = await scraper.fetch(
      "https://handletheheat.com/how-to-make-empanadas/#wprm-recipe-container-26286"
    );

    expect(recipe.name).toBe("Beef Empanadas");
    expect(recipe.ingredients.length).toBe(25);
    expect(recipe.steps.length).toBe(10);
  });

  it("should return oatmeal creme pies from americastestkitchen", async () => {
    const recipe = await scraper.fetch(
      "https://www.americastestkitchen.com/recipes/15131-oatmeal-creme-pies"
    );

    expect(recipe.name).toBe("Oatmeal Creme Pies");
    expect(recipe.ingredients.length).toBe(18);
    expect(recipe.steps.length).toBe(6);
  });

  // These tests are skipped because the websites block CI environments or close connections
  it.skip("should return fettucine with creamy red pepper from foodnetwork", async () => {
    // Skipped: Website blocks CI environments
    // Error: Unable to fetch (likely bot detection/rate limiting)
    const recipe = await scraper.fetch(
      "https://www.foodnetwork.com/recipes/ellie-krieger/fettuccine-with-creamy-red-pepper-feta-sauce-recipe-1946840"
    );

    expect(recipe.name).toBe("Fettuccine with Creamy Red Pepper-Feta Sauce");
    expect(recipe.ingredients.length).toBe(10);
    expect(recipe.steps.length).toBe(1);
    expect(recipe.prepTime).toBe("12 min");
    expect(recipe.cookTime).toBe("25 min");
  });

  it.skip("should return italian wedding cookies recipe from siciliangirl", async () => {
    // Skipped: Website actively closes connections (blocks scrapers)
    // Error: SocketError: other side closed
    const recipe = await scraper.fetch(
      "https://siciliangirl.com/2014/12/italian-wedding-cookies/"
    );

    expect(recipe.name).toBe("Italian Wedding Cookies");
    expect(recipe.ingredients.length).toBeGreaterThan(0);
    expect(recipe.steps.length).toBeGreaterThan(0);
  });
});

