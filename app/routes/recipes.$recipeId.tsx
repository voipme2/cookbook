import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import type { Recipe } from "~/types";
import { getRecipeById } from "~/lib/queries/recipes";
import { RecipeOptions } from "~/components/RecipeOptions";
import { CookModeButton } from "~/components/CookModeButton";
import { Edit, Printer, ShoppingCart } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.recipe) {
    return [{ title: "Recipe not found - The Trusted Palate" }];
  }
  return [
    { title: `${data.recipe.name} - The Trusted Palate` },
    { name: "description", content: data.recipe.description || "" },
  ];
};

interface LoaderData {
  recipe: Recipe;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { recipeId } = params;

  if (!recipeId) {
    throw new Response("Recipe ID is required", { status: 400 });
  }

  const recipe = await getRecipeById(recipeId);

  if (!recipe) {
    throw new Response("Recipe not found", { status: 404 });
  }

  return json<LoaderData>({ recipe });
}

// Helper function to convert duration strings to minutes
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
  let minutes = 0;
  const hourMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
  const minMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*mins?/i);
  
  if (hourMatch) {
    minutes += Math.round(parseFloat(hourMatch[1]) * 60);
  }
  if (minMatch) {
    minutes += Math.round(parseFloat(minMatch[1]));
  }
  
  return minutes;
}

// Helper function to convert minutes to human-readable format
function formatMinutesToTime(totalMinutes: number): string {
  if (totalMinutes === 0) return "";
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  } else {
    return `${hours} hr${hours > 1 ? "s" : ""} ${mins} min`;
  }
}

export default function RecipeDetail() {
  const { recipe } = useLoaderData<typeof loader>();

  // Calculate total time
  const prepMinutes = parseTimeToMinutes(recipe.prepTime || "");
  const cookMinutes = parseTimeToMinutes(recipe.cookTime || "");
  const inactiveMinutes = parseTimeToMinutes(recipe.inactiveTime || "");
  const totalMinutes = prepMinutes + cookMinutes + inactiveMinutes;
  const totalTimeFormatted = formatMinutesToTime(totalMinutes);

  return (
    <div className="space-y-8">
      <div className="flex-1">
        <Link
          to="/recipes"
          className="text-blue-500 hover:text-blue-600 mb-4 inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Recipes
        </Link>
        <div className="flex items-start gap-3 mb-3">
          <h1 className="text-4xl font-bold flex-1 dark:text-slate-100">{recipe.name}</h1>
          <div className="flex gap-2 items-center">
            <Link
              to={`/recipes/${recipe.id}/shopping-list`}
              title="Generate shopping list"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
            </Link>
            <a
              href={`/print/${recipe.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Print recipe"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Printer size={20} />
            </a>
            <Link
              to={`/recipes/${recipe.id}/edit`}
              title="Edit recipe"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
            >
              <Edit size={20} />
            </Link>
          </div>
        </div>
        {recipe.description && (
          <p className="text-gray-700 dark:text-slate-300 text-lg leading-relaxed mb-6">{recipe.description}</p>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <CookModeButton />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">🥘 Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Steps */}
          <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">👨‍🍳 Instructions</h2>
            {recipe.steps && recipe.steps.length > 0 ? (
              <ol className="space-y-3">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="font-bold text-blue-500 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-600 dark:text-slate-300 italic">Just mix the ingredients!</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Recipe Image */}
          {recipe.image && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Cooking Info */}
          <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4 dark:text-slate-100">⏱️ Cooking Info</h3>
            <div className="space-y-3 text-sm">
              {recipe.servings && (
                <p className="dark:text-slate-300">
                  <span className="font-semibold">Servings:</span>{" "}
                  {recipe.servings}
                </p>
              )}
              {recipe.prepTime && (
                <p className="dark:text-slate-300">
                  <span className="font-semibold">Prep Time:</span>{" "}
                  {recipe.prepTime}
                </p>
              )}
              {recipe.cookTime && (
                <p className="dark:text-slate-300">
                  <span className="font-semibold">Cook Time:</span>{" "}
                  {recipe.cookTime}
                </p>
              )}
              {recipe.inactiveTime && (
                <p className="dark:text-slate-300">
                  <span className="font-semibold">Inactive Time:</span>{" "}
                  {recipe.inactiveTime}
                </p>
              )}
              {totalTimeFormatted && (
                <p className="dark:text-slate-300 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <span className="font-semibold">Total Time:</span>{" "}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{totalTimeFormatted}</span>
                </p>
              )}
              {recipe.difficulty && (
                <p className="dark:text-slate-300">
                  <span className="font-semibold">Difficulty:</span>{" "}
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium ml-1">
                    {recipe.difficulty}
                  </span>
                </p>
              )}
            </div>

            {/* Recipe Options */}
            {recipe.options && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <RecipeOptions options={recipe.options} variant="block" />
              </div>
            )}
          </section>

          {/* Groups */}
          {recipe.groups && recipe.groups.length > 0 && (
            <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="font-bold text-lg mb-4 dark:text-slate-100">📁 Groups</h3>
              <div className="space-y-2">
                {recipe.groups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="block bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-200 transition-colors"
                  >
                    {group.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {recipe.notes && (
            <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="font-bold text-lg mb-3 dark:text-slate-100">📝 Notes</h3>
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{recipe.notes}</p>
            </section>
          )}

          {/* Source */}
          {recipe.source && (
            <section className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-slate-800 shadow-sm">
              <h3 className="font-bold text-lg mb-3 dark:text-slate-100">🔗 Source</h3>
              <a
                href={recipe.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm break-all transition-colors"
              >
                {recipe.source}
              </a>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

