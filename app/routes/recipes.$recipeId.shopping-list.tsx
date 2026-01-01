import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import type { ShoppingListItem } from "~/lib/shopping-list";
import { generateShoppingList } from "~/lib/shopping-list";
import { ShoppingList } from "~/components/ShoppingList";
import type { Recipe } from "~/types";
import { getRecipeById } from "~/lib/queries/recipes";
import { ArrowLeft, Plus } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.recipe) {
    return [{ title: "Recipe not found - The Trusted Palate" }];
  }
  return [
    {
      title: `Shopping List - ${data.recipe.name} - The Trusted Palate`,
    },
    {
      name: "description",
      content: `Shopping list for ${data.recipe.name}`,
    },
  ];
};

interface LoaderData {
  recipe: Recipe;
  shoppingList: ShoppingListItem[];
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

  const shoppingList = generateShoppingList([recipe]);

  return json<LoaderData>({ recipe, shoppingList });
}

export default function RecipeShoppingList() {
  const { recipe, shoppingList } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/recipes/${recipe.id}`}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to {recipe.name}
          </Link>
          <h1 className="text-4xl font-bold dark:text-slate-100">
            Shopping List
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            {recipe.name}
          </p>
        </div>
      </div>

      {/* Recipe summary */}
      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400 font-semibold mb-2">
              Recipe:
            </p>
            <Link
              to={`/recipes/${recipe.id}`}
              className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {recipe.name}
            </Link>
          </div>
          <Link
            to="/groups/new"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            Create Group
          </Link>
        </div>
      </div>

      {/* Shopping list */}
      <ShoppingList 
        items={shoppingList} 
        printUrl={`/print/recipes/${recipe.id}/shopping-list`}
        recipes={[recipe]}
      />
    </div>
  );
}

