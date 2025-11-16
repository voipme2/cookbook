import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useMemo } from "react";
import type { Recipe } from "~/types";
import { getAllRecipes } from "~/lib/queries/recipes";
import { RecipeOptions } from "~/components/RecipeOptions";

export const meta: MetaFunction = () => {
  return [
    { title: "Recipes - The Trusted Palate" },
    { name: "description", content: "Browse all recipes in your cookbook" },
  ];
};

interface LoaderData {
  recipes: Recipe[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const recipes = await getAllRecipes();
  return json<LoaderData>({ recipes });
}

export default function RecipesIndex() {
  const { recipes } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes;
    }

    const query = searchQuery.toLowerCase();
    return recipes.filter((recipe) => {
      const name = recipe.name?.toLowerCase() || "";
      const description = recipe.description?.toLowerCase() || "";
      const ingredients = recipe.ingredients?.map((i) => i.toLowerCase()).join(" ") || "";
      
      // Build options string for searching
      const options = [];
      if (recipe.options?.isVegetarian) options.push("vegetarian");
      if (recipe.options?.isVegan) options.push("vegan");
      if (recipe.options?.isDairyFree) options.push("dairy free");
      if (recipe.options?.isGlutenFree) options.push("gluten free");
      if (recipe.options?.isCrockPot) options.push("crock pot");
      const optionsString = options.join(" ");

      return (
        name.includes(query) ||
        description.includes(query) ||
        ingredients.includes(query) ||
        optionsString.includes(query)
      );
    });
  }, [recipes, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          placeholder="Search recipes by name, ingredients, or more..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="bg-gray-400 hover:bg-gray-500 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            Clear
          </button>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600 dark:text-slate-400 text-lg mb-6 font-medium">
            {searchQuery
              ? `No recipes found matching "${searchQuery}"`
              : "No recipes yet. Create one to get started!"}
          </p>
          {!searchQuery && (
            <Link
              to="/recipes/new"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              + Create First Recipe
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

function isValidTime(time: string | undefined): boolean {
  if (!time) return false;
  // Don't show "0", "00", or similar values
  return !time.match(/^0+$/);
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:scale-102 transition-all duration-300 bg-white dark:bg-slate-800 flex flex-col h-full sm:flex-row sm:gap-4"
    >
      {/* Image Section - Mobile: small, Desktop: side-by-side */}
      {recipe.image && (
        <div className="sm:w-32 sm:flex-shrink-0 h-28 sm:h-32 bg-gray-100 dark:bg-slate-700 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* Content Section */}
      <div className="p-4 sm:p-4 flex flex-col flex-grow min-w-0">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg line-clamp-2 dark:text-slate-100 mb-1">
          {recipe.name}
        </h3>

        {/* Description */}
        {recipe.description && (
          <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 mb-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Options */}
        {recipe.options && (
          <div className="mb-2">
            <RecipeOptions options={recipe.options} variant="inline" />
          </div>
        )}

        {/* Cooking Times - compact footer */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400 mt-auto pt-2 border-t border-gray-100 dark:border-slate-700">
          {isValidTime(recipe.prepTime) && <span className="flex items-center gap-1">⏱️ {recipe.prepTime}</span>}
          {isValidTime(recipe.cookTime) && <span className="flex items-center gap-1">🍳 {recipe.cookTime}</span>}
        </div>
      </div>
    </Link>
  );
}

