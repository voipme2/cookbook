import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import type { Recipe } from "~/types";
import { getRecipeById } from "~/lib/queries/recipes";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.recipe) {
    return [{ title: "Recipe not found - The Trusted Palate" }];
  }
  return [
    { title: `${data.recipe.name} - The Trusted Palate` },
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

export default function PrintRecipe() {
  const { recipe } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-gray-600 italic">{recipe.description}</p>
          )}
        </div>

        {/* Cooking Info */}
        <div className="mb-8 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
          {recipe.servings && (
            <div>
              <span className="font-semibold">Servings:</span> {recipe.servings}
            </div>
          )}
          {recipe.prepTime && (
            <div>
              <span className="font-semibold">Prep Time:</span> {recipe.prepTime}
            </div>
          )}
          {recipe.cookTime && (
            <div>
              <span className="font-semibold">Cook Time:</span> {recipe.cookTime}
            </div>
          )}
          {recipe.inactiveTime && (
            <div>
              <span className="font-semibold">Inactive Time:</span> {recipe.inactiveTime}
            </div>
          )}
          {recipe.author && (
            <div>
              <span className="font-semibold">Author:</span> {recipe.author}
            </div>
          )}
          {recipe.difficulty && (
            <div>
              <span className="font-semibold">Difficulty:</span> {recipe.difficulty}
            </div>
          )}
        </div>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-300">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-3 text-gray-400">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-300">
            Instructions
          </h2>
          {recipe.steps && recipe.steps.length > 0 ? (
            <ol className="space-y-3">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="font-bold text-gray-500 flex-shrink-0 min-w-6">
                    {idx + 1}.
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 italic">No instructions provided.</p>
          )}
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="mb-8 bg-yellow-50 p-4 rounded border border-yellow-200">
            <h3 className="font-bold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{recipe.notes}</p>
          </div>
        )}

        {/* Source */}
        {recipe.source && (
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <span className="font-semibold">Source:</span> {recipe.source}
          </div>
        )}

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .max-w-2xl {
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

