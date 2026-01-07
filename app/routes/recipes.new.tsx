import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/server-runtime";
import { Form, Link, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { createRecipe } from "~/lib/queries/recipes";
import { ImageUploader } from "~/components/ImageUploader";
import { ListItemManager, StepsManager } from "~/components/ListItemManager";
import { RecipeOptionsCheckboxes } from "~/components/RecipeOptionsCheckboxes";
import { useImageUpload } from "~/hooks/useImageUpload";
import {
  buildRecipeData,
  validateRecipeData,
  getParamValue,
  getParamArray,
} from "~/lib/recipe-form.utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Recipe - The Trusted Palate" },
    { name: "description", content: "Create a new recipe" },
  ];
};

interface ActionData {
  errors?: {
    name?: string;
    general?: string;
  };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json<ActionData>(
      { errors: { general: "Method not allowed" } },
      { status: 405 }
    );
  }

  const formData = await request.formData();
  const url = new URL(request.url);

  const recipeData = buildRecipeData(formData, url.searchParams);
  const validationErrors = validateRecipeData(recipeData);

  if (validationErrors) {
    return json<ActionData>({ errors: validationErrors }, { status: 400 });
  }

  try {
    const recipeId = await createRecipe(recipeData);
    return redirect(`/recipes/${recipeId}`);
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return json<ActionData>(
      { errors: { general: "Failed to create recipe. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewRecipe() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams] = useSearchParams();

  // Image handling via custom hook
  const { image, handleImageUpload, handleRemoveImage } = useImageUpload();

  // Initialize ingredients and steps from URL params (for scraper pre-fill)
  const [ingredients, setIngredients] = useState<string[]>(
    getParamArray(searchParams, "ingredients", [""])
  );
  const [steps, setSteps] = useState<string[]>(
    getParamArray(searchParams, "steps", [""])
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link to="/recipes" className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
          ← Back to Recipes
        </Link>
        <h1 className="text-3xl font-bold">Create New Recipe</h1>
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
            defaultValue={getParamValue(searchParams, "name")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              actionData?.errors?.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="e.g., Chocolate Chip Cookies"
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
            defaultValue={getParamValue(searchParams, "description")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the recipe"
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
            defaultValue={getParamValue(searchParams, "author")}
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
              defaultValue={getParamValue(searchParams, "servings")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g., 4"
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
              defaultValue={getParamValue(searchParams, "prepTime")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g., 15 min"
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
              defaultValue={getParamValue(searchParams, "cookTime")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g., 30 min"
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
              defaultValue={getParamValue(searchParams, "inactiveTime")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              placeholder="e.g., 2 hr (chilling)"
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
        <RecipeOptionsCheckboxes />

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? "Creating..." : "Create Recipe"}
          </button>
          <Link
            to="/recipes"
            className="flex-1 text-center bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}
