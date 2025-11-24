import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getGroupById, updateGroup, addRecipeToGroup, removeRecipeFromGroup } from "~/lib/queries/groups";
import { getAllRecipes, getRecipesByGroup } from "~/lib/queries/recipes";
import type { Group, Recipe } from "~/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.group) {
    return [{ title: "Edit Group - The Trusted Palate" }];
  }
  return [
    { title: `Edit ${data.group.name} - The Trusted Palate` },
  ];
};

interface LoaderData {
  group: Group;
  allRecipes: Recipe[];
  groupRecipes: Recipe[];
}

interface ActionData {
  errors?: {
    name?: string;
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
    throw new Response("Group not found", { status: 404 });
  }

  const allRecipes = await getAllRecipes();
  const groupRecipes = await getRecipesByGroup(groupId);

  return json<LoaderData>({ group, allRecipes, groupRecipes });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { groupId } = params;

  if (!groupId) {
    return json<ActionData>(
      { errors: { general: "Group ID is required" } },
      { status: 400 }
    );
  }

  if (request.method !== "POST") {
    return json<ActionData>(
      { errors: { general: "Method not allowed" } },
      { status: 405 }
    );
  }

  const formData = await request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Validation
  if (!name || name.trim().length === 0) {
    return json<ActionData>(
      { errors: { name: "Group name is required" } },
      { status: 400 }
    );
  }

  try {
    await updateGroup(groupId, {
      name,
      description: description || undefined,
    });

    // Handle recipe additions/removals
    const currentRecipes = await getRecipesByGroup(groupId);
    const currentRecipeIds = new Set(currentRecipes.map(r => r.id));

    // Get all recipes that should be in the group
    const formEntries = Array.from(formData.entries());
    const selectedRecipeIds = new Set<string>();
    
    for (const [key, value] of formEntries) {
      if (key.startsWith("recipe-") && value === "on") {
        const recipeId = key.replace("recipe-", "");
        selectedRecipeIds.add(recipeId);
      }
    }

    // Add recipes that are now selected
    for (const recipeId of selectedRecipeIds) {
      if (!currentRecipeIds.has(recipeId)) {
        await addRecipeToGroup(groupId, recipeId);
      }
    }

    // Remove recipes that are no longer selected
    for (const recipeId of currentRecipeIds) {
      if (!selectedRecipeIds.has(recipeId)) {
        await removeRecipeFromGroup(groupId, recipeId);
      }
    }

    return redirect(`/groups/${groupId}`);
  } catch (error) {
    console.error("Failed to update group:", error);
    return json<ActionData>(
      { errors: { general: "Failed to update group. Please try again." } },
      { status: 500 }
    );
  }
}

function RecipeSelector({ allRecipes, groupRecipes }: { allRecipes: Recipe[]; groupRecipes: Recipe[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedRecipes, setCheckedRecipes] = useState<Set<string>>(
    new Set(groupRecipes.map(r => r.id))
  );

  const groupRecipeIds = checkedRecipes;

  // Split into in collection and available
  const inCollection = allRecipes.filter(r => groupRecipeIds.has(r.id));
  
  // Only filter the available recipes based on search query
  const availableUnfiltered = allRecipes.filter(r => !groupRecipeIds.has(r.id));
  const available = availableUnfiltered.filter(recipe => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(query) ||
      (recipe.description && recipe.description.toLowerCase().includes(query))
    );
  });

  const handleToggle = (recipeId: string) => {
    const newChecked = new Set(checkedRecipes);
    if (newChecked.has(recipeId)) {
      newChecked.delete(recipeId);
    } else {
      newChecked.add(recipeId);
    }
    setCheckedRecipes(newChecked);
  };

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div>
        <input
          type="text"
          placeholder="Search recipes by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {allRecipes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recipes available yet.</p>
      ) : availableUnfiltered.length === 0 && inCollection.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recipes available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Currently in Group */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-green-600 dark:text-green-400">
              ✓ In Group ({inCollection.length})
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {inCollection.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No recipes selected yet.</p>
              ) : (
                inCollection.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleToggle(recipe.id)}
                    className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={`recipe-${recipe.id}`}
                      checked={true}
                      onChange={() => {}}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{recipe.name}</div>
                      {recipe.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {recipe.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available to Add */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-blue-600 dark:text-blue-400">
              + Add to Group ({available.length})
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {available.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  {searchQuery ? "No recipes match your search." : availableUnfiltered.length === 0 ? "All recipes are in this group!" : "No recipes to add."}
                </p>
              ) : (
                available.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleToggle(recipe.id)}
                    className="flex items-start space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={`recipe-${recipe.id}`}
                      checked={false}
                      onChange={() => {}}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{recipe.name}</div>
                      {recipe.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {recipe.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden checkboxes for form submission */}
      {Array.from(checkedRecipes).map(recipeId => (
        <input
          key={recipeId}
          type="hidden"
          name={`recipe-${recipeId}`}
          value="on"
        />
      ))}
    </div>
  );
}

export default function EditGroup() {
  const { group, allRecipes, groupRecipes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          to={`/groups/${group.id}`}
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Back to Group
        </Link>
        <h1 className="text-3xl font-bold">✏️ Edit Group</h1>
      </div>

      {actionData?.errors?.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {actionData.errors.general}
        </div>
      )}

      <Form method="post" className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-bold mb-2">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={group.name}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              actionData?.errors?.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {actionData?.errors?.name && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={group.description || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Recipes */}
        <div>
          <label className="block font-bold mb-4 text-lg">
            Manage Recipes
          </label>
          <RecipeSelector allRecipes={allRecipes} groupRecipes={groupRecipes} />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white dark:text-white px-6 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to={`/groups/${group.id}`}
            className="flex-1 text-center bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
          >
            Cancel
          </Link>
        </div>
      </Form>
      
      {/* Delete Button */}
      <div className="pt-4 border-t border-gray-300">
        <Form
          method="post"
          action={`/groups/${group.id}/delete`}
          onSubmit={(e) => {
            if (
              !window.confirm(
                `Are you sure you want to delete "${group.name}"? This will not delete the recipes, only the group. This action cannot be undone.`
              )
            ) {
              e.preventDefault();
            }
          }}
          className="inline"
        >
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Delete Group
          </button>
        </Form>
      </div>
    </div>
  );
}

