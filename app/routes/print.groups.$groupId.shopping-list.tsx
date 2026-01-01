import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { useLoaderData } from "@remix-run/react";
import type { ShoppingListItem } from "~/lib/shopping-list";
import { generateShoppingList } from "~/lib/shopping-list";
import type { Group, Recipe } from "~/types";
import { getGroupById } from "~/lib/queries/groups";
import { getRecipesByGroup } from "~/lib/queries/recipes";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.group) {
    return [{ title: "Shopping List - The Trusted Palate" }];
  }
  return [
    { title: `Shopping List - ${data.group.name} - The Trusted Palate` },
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

export default function PrintShoppingList() {
  const { group, recipes, shoppingList } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-300">
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-gray-600">
            {group.name}
            {recipes.length > 0 && ` • ${recipes.length} recipe${recipes.length !== 1 ? "s" : ""}`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Recipes Included */}
        {recipes.length > 0 && (
          <div className="mb-8 bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Recipes Included:</h2>
            <div className="flex flex-wrap gap-2">
              {recipes.map((recipe) => (
                <span key={recipe.id} className="text-sm text-gray-700">
                  {recipe.name}
                  {recipe !== recipes[recipes.length - 1] && ","}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List Items */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-300">
            Ingredients
          </h2>
          {shoppingList.length > 0 ? (
            <ul className="space-y-4">
              {shoppingList.map((item, index) => (
                <li key={`${item.item}-${index}`} className="pb-3 border-b border-gray-200 last:border-b-0">
                  <div className="font-semibold text-lg mb-2 capitalize">
                    ☐ {item.item}
                  </div>
                  {item.entries.length > 0 && (
                    <div className="ml-6 space-y-1 text-sm text-gray-600">
                      {item.entries.map((entry, idx) => (
                        <div key={idx} className="italic">
                          <span className="font-medium not-italic">{entry.recipe}:</span> {entry.ingredient}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No ingredients found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Total unique ingredients: {shoppingList.length}</p>
        </div>

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

