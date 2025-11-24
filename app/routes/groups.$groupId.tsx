import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import type { Group, Recipe } from "~/types";
import { getGroupById, getGroupRecipeCount } from "~/lib/queries/groups";
import { getRecipesByGroup } from "~/lib/queries/recipes";
import { RecipeOptions } from "~/components/RecipeOptions";
import { Edit, Trash2, ShoppingCart } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.group) {
    return [{ title: "Group not found - The Trusted Palate" }];
  }
  return [
    { title: `${data.group.name} - The Trusted Palate` },
    { name: "description", content: data.group.description || "" },
  ];
};

interface LoaderData {
  group: Group;
  recipeCount: number;
  recipes: any[];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { groupId } = params;

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const group = await getGroupById(groupId);

  if (!group) {
    throw new Response("Group not found", { status: 404 });
  }

  const recipes = await getRecipesByGroup(groupId);
  const recipeCount = await getGroupRecipeCount(groupId);

  return json<LoaderData>({ group, recipes, recipeCount });
}

export default function GroupDetail() {
  const { group, recipes, recipeCount } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Link
            to="/groups"
            className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
          >
            ← Back to Groups
          </Link>
          <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 text-lg">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {recipes.length > 0 && (
            <>
              <Link
                to={`/groups/${group.id}/shopping-list`}
                title="Generate shopping list"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} />
              </Link>
              <button
                onClick={() => {
                  recipes.forEach((recipe) => {
                    window.open(`/recipes/${recipe.id}`, '_blank');
                  });
                }}
                title="Open all recipes in new tabs"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </>
          )}
          <Link
            to={`/groups/${group.id}/edit`}
            title="Edit group"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
          >
            <Edit size={20} />
          </Link>
          <Form
            method="post"
            action={`/groups/${group.id}/delete`}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  `Are you sure you want to delete "${group.name}"? This will not delete the recipes.`
                )
              ) {
                e.preventDefault();
              }
            }}
            className="inline"
          >
            <button
              type="submit"
              title="Delete group"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </Form>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
        <p className="text-gray-700 dark:text-slate-300">
          <span className="font-semibold">Recipes:</span>{" "}
          {recipeCount === 0 ? (
            <span>No recipes in this group</span>
          ) : (
            <span>
              {recipeCount} recipe{recipeCount === 1 ? "" : "s"}
            </span>
          )}
        </p>
      </div>

      {recipes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold dark:text-slate-100">Recipes in this Group</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
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

