import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/server-runtime";
import { Form, Link, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getRecipeById, updateRecipe } from "~/lib/queries/recipes";
import { ImageUploader } from "~/components/ImageUploader";
import { ListItemManager, StepsManager } from "~/components/ListItemManager";
import { RecipeOptionsCheckboxes } from "~/components/RecipeOptionsCheckboxes";
import { useImageUpload } from "~/hooks/useImageUpload";
import {
  extractIndexedFormValues,
  extractRecipeOptions,
  validateRecipeData,
} from "~/lib/recipe-form.utils";
import type { Recipe } from "~/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.recipe) {
    return [{ title: "Edit Recipe - The Trusted Palate" }];
  }
  return [{ title: `Edit ${data.recipe.name} - The Trusted Palate` }];
};

interface LoaderData {
  recipe: Recipe;
}

interface ActionData {
  errors?: {
    name?: string;
    general?: string;
  };
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

export async function action({ request, params }: ActionFunctionArgs) {
  const { recipeId } = params;

  if (!recipeId) {
    return json<ActionData>(
      { errors: { general: "Recipe ID is required" } },
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

  // Get existing recipe to preserve image if not changed
  const existing = await getRecipeById(recipeId);
  if (!existing) {
    return json<ActionData>(
      { errors: { general: "Recipe not found" } },
      { status: 404 }
    );
  }

  // Get form values
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const author = formData.get("author") as string;
  const servings = formData.get("servings") as string;
  const prepTime = formData.get("prepTime") as string;
  const cookTime = formData.get("cookTime") as string;
  const inactiveTime = formData.get("inactiveTime") as string;
  const imageValue = formData.get("image") as string;

  const ingredients = extractIndexedFormValues(formData, "ingredient");
  const steps = extractIndexedFormValues(formData, "step");
  const options = extractRecipeOptions(formData);

  // Validation
  const validationErrors = validateRecipeData({ name } as Omit<Recipe, "id">);
  if (validationErrors) {
    return json<ActionData>({ errors: validationErrors }, { status: 400 });
  }

  try {
    const recipeData: Partial<Recipe> = {
      name,
      description: description || undefined,
      author: author || undefined,
      servings: servings || undefined,
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      inactiveTime: inactiveTime || undefined,
      ingredients,
      steps,
      options,
    };

    // Only include image if it was explicitly changed
    // If imageValue is empty string, user removed it (set to undefined)
    // If imageValue is the same as existing, don't include it (preserve existing)
    // If imageValue is different, include the new value
    if (imageValue !== null) {
      if (imageValue === "") {
        recipeData.image = undefined;
      } else if (imageValue !== existing.image) {
        recipeData.image = imageValue;
      }
    }

    await updateRecipe(recipeId, recipeData);

    return redirect(`/recipes/${recipeId}`);
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return json<ActionData>(
      { errors: { general: "Failed to update recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function EditRecipe() {
  const { recipe } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Image handling via custom hook
  const { image, handleImageUpload, handleRemoveImage } = useImageUpload({
    initialImage: recipe.image || "",
  });

  const [ingredients, setIngredients] = useState<string[]>(
    recipe.ingredients || [""]
  );
  const [steps, setSteps] = useState<string[]>(recipe.steps || [""]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          to={`/recipes/${recipe.id}`}
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Back to Recipe
        </Link>
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
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
            Recipe Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={recipe.name}
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
            rows={3}
            defaultValue={recipe.description || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block font-bold mb-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            defaultValue={recipe.author || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Image Upload */}
        <ImageUploader
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          currentImage={image}
        />

        {/* Cooking Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="servings" className="block font-bold mb-2">
              Servings
            </label>
            <input
              type="text"
              id="servings"
              name="servings"
              defaultValue={recipe.servings || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="prepTime" className="block font-bold mb-2">
              Prep Time
            </label>
            <input
              type="text"
              id="prepTime"
              name="prepTime"
              defaultValue={recipe.prepTime || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="cookTime" className="block font-bold mb-2">
              Cook Time
            </label>
            <input
              type="text"
              id="cookTime"
              name="cookTime"
              defaultValue={recipe.cookTime || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="inactiveTime" className="block font-bold mb-2">
              Inactive Time
            </label>
            <input
              type="text"
              id="inactiveTime"
              name="inactiveTime"
              defaultValue={recipe.inactiveTime || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Ingredients */}
        <ListItemManager
          items={ingredients}
          setItems={setIngredients}
          label="Ingredients"
          placeholder="Enter ingredient..."
          fieldPrefix="ingredient"
        />

        {/* Steps */}
        <StepsManager steps={steps} setSteps={setSteps} />

        {/* Recipe Options */}
        <RecipeOptionsCheckboxes defaultValues={recipe.options} />

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to={`/recipes/${recipe.id}`}
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
          action={`/recipes/${recipe.id}/delete`}
          onSubmit={(e) => {
            if (
              !window.confirm(
                `Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`
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
            Delete Recipe
          </button>
        </Form>
      </div>
    </div>
  );
}
