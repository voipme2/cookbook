import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import type { ShoppingListItem } from "~/lib/shopping-list";
import { generateShoppingList } from "~/lib/shopping-list";
import { ShoppingList } from "~/components/ShoppingList";
import type { Group, Recipe } from "~/types";
import { getGroupById } from "~/lib/queries/groups";
import { getRecipesByGroup } from "~/lib/queries/recipes";
import { ArrowLeft } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.group) {
    return [{ title: "Group not found - The Trusted Palate" }];
  }
  return [
    {
      title: `Shopping List - ${data.group.name} - The Trusted Palate`,
    },
    {
      name: "description",
      content: `Shopping list for ${data.group.name} recipes`,
    },
  ];
};

interface LoaderData {
  group: Group;
  recipes: Recipe[];
  shoppingList: ShoppingListItem[];
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
  const shoppingList = generateShoppingList(recipes);

  return json<LoaderData>({ group, recipes, shoppingList });
}

export default function GroupShoppingList() {
  const { group, recipes, shoppingList } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/groups/${group.id}`}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft size={20} />
            Back to {group.name}
          </Link>
          <h1 className="text-4xl font-bold dark:text-slate-100">
            Shopping List
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            {group.name}
            {recipes.length > 0 && ` • ${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Recipe summary */}
      {recipes.length > 0 && (
        <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-slate-400 font-semibold mb-2">
            Recipes Included:
          </p>
          <div className="flex flex-wrap gap-2">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {recipe.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shopping list */}
      <ShoppingList 
        items={shoppingList} 
        printUrl={`/print/groups/${group.id}/shopping-list`}
        recipes={recipes}
      />
    </div>
  );
}

