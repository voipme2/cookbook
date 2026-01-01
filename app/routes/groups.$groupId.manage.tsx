import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/server-runtime";
import { useLoaderData, Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { getGroupById } from "~/lib/queries/groups";
import { getRecipesByGroup, getAllRecipes } from "~/lib/queries/recipes";
import { addRecipeToGroup, removeRecipeFromGroup } from "~/lib/queries/groups";
import type { Group } from "~/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.group) {
    return [{ title: "Manage Collection - Cookbook" }];
  }
  return [
    { title: `Manage ${data.group.name} - Cookbook` },
  ];
};

interface LoaderData {
  group: Group;
  currentRecipes: any[];
  availableRecipes: any[];
}

interface ActionData {
  errors?: {
    general?: string;
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { groupId } = params;

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  const group = await getGroupById(groupId);

  if (!group) {
    throw new Response("Collection not found", { status: 404 });
  }

  const currentRecipes = await getRecipesByGroup(groupId);
  const allRecipes = await getAllRecipes();

  // Filter out recipes already in the group
  const currentIds = new Set(currentRecipes.map((r: any) => r.id));
  const availableRecipes = allRecipes.filter((r: any) => !currentIds.has(r.id));

  return json<LoaderData>({
    group,
    currentRecipes,
    availableRecipes,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { groupId } = params;

  if (!groupId) {
    return json<ActionData>(
      { errors: { general: "Group ID is required" } },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;
  const recipeId = formData.get("recipeId") as string;

  if (!action || !recipeId) {
    return json<ActionData>(
      { errors: { general: "Invalid request" } },
      { status: 400 }
    );
  }

  try {
    if (action === "add") {
      await addRecipeToGroup(groupId, recipeId);
    } else if (action === "remove") {
      await removeRecipeFromGroup(groupId, recipeId);
    } else {
      return json<ActionData>(
        { errors: { general: "Invalid action" } },
        { status: 400 }
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("Failed to update group membership:", error);
    return json<ActionData>(
      { errors: { general: "Failed to update group membership" } },
      { status: 500 }
    );
  }
}

export default function ManageGroup() {
  const { group, currentRecipes, availableRecipes } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/groups/${group.id}`}
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Back to {group.name}
        </Link>
        <h1 className="text-3xl font-bold">Manage Collection</h1>
        <p className="text-gray-600">{group.name}</p>
      </div>

      {actionData?.errors?.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {actionData.errors.general}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Recipes */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            In Collection ({currentRecipes.length})
          </h2>
          {currentRecipes.length === 0 ? (
            <p className="text-gray-500">No recipes in this collection yet</p>
          ) : (
            <div className="space-y-2">
              {currentRecipes.map((recipe: any) => (
                <div
                  key={recipe.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                >
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="text-blue-500 hover:text-blue-600 flex-1"
                  >
                    {recipe.name}
                  </Link>
                  <Form method="post" className="ml-2">
                    <input type="hidden" name="_action" value="remove" />
                    <input type="hidden" name="recipeId" value={recipe.id} />
                    <button
                      type="submit"
                      disabled={navigation.state === "submitting"}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Recipes */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            Available ({availableRecipes.length})
          </h2>
          {availableRecipes.length === 0 ? (
            <p className="text-gray-500">All recipes are in this collection</p>
          ) : (
            <div className="space-y-2">
              {availableRecipes.map((recipe: any) => (
                <div
                  key={recipe.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border"
                >
                  <Link
                    to={`/recipes/${recipe.id}`}
                    className="text-blue-500 hover:text-blue-600 flex-1"
                  >
                    {recipe.name}
                  </Link>
                  <Form method="post" className="ml-2">
                    <input type="hidden" name="_action" value="add" />
                    <input type="hidden" name="recipeId" value={recipe.id} />
                    <button
                      type="submit"
                      disabled={navigation.state === "submitting"}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-semibold"
                    >
                      Add
                    </button>
                  </Form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

