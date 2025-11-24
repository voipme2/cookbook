import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { createRecipe } from "~/lib/queries/recipes";
import { ImageUploader } from "~/components/ImageUploader";
import { IngredientInput } from "~/components/IngredientInput";
import type { Recipe } from "~/types";

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

  // Helper function to get values from form data or URL params
  const getValue = (key: string) => {
    const formValue = formData.get(key);
    if (formValue) return formValue as string;
    return url.searchParams.get(key) || "";
  };

  // Helper function to get array values (handles both JSON arrays from URL and newline-separated from form)
  const getArrayValue = (key: string): string[] => {
    const formValue = formData.get(key);
    const urlValue = url.searchParams.get(key);
    const value = formValue || urlValue;
    
    if (!value) return [];
    
    try {
      // Try to parse as JSON first (from URL params)
      const parsed = JSON.parse(value as string);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter((item) => item.length > 0);
      }
    } catch {
      // If JSON parsing fails, treat as newline-separated (from form data)
      if (typeof value === "string") {
        return value
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    }
    
    return [];
  };

  // Get form values
  const name = getValue("name");
  const description = getValue("description");
  const servings = getValue("servings");
  const prepTime = getValue("prepTime");
  const cookTime = getValue("cookTime");
  const inactiveTime = getValue("inactiveTime");
  const difficulty = getValue("difficulty");
  const notes = getValue("notes");
  const source = getValue("source");
  const image = getValue("image");
  const ingredients = getArrayValue("ingredients");
  const steps = getArrayValue("steps");
  
  // Get recipe options
  const options = {
    isVegetarian: formData.get("isVegetarian") === "on",
    isVegan: formData.get("isVegan") === "on",
    isDairyFree: formData.get("isDairyFree") === "on",
    isGlutenFree: formData.get("isGlutenFree") === "on",
    isCrockPot: formData.get("isCrockPot") === "on",
  };

  // Validation
  if (!name || name.trim().length === 0) {
    return json<ActionData>(
      { errors: { name: "Recipe name is required" } },
      { status: 400 }
    );
  }

  try {
    const recipeData: Omit<Recipe, "id"> = {
      name,
      description: description || undefined,
      servings: servings || undefined,
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      inactiveTime: inactiveTime || undefined,
      difficulty: difficulty || undefined,
      notes: notes || undefined,
      source: source || undefined,
      image: image || undefined,
      ingredients,
      steps,
      options,
    };

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
  const [image, setImage] = useState<string>("");

  // Parse query parameters for pre-filled data from scraper
  const getParamValue = (key: string, defaultValue: string = "") => {
    const value = searchParams.get(key);
    return value || defaultValue;
  };

  const getParamArray = (key: string, defaultValue: string[] = []) => {
    const value = searchParams.get(key);
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  };

  const [ingredients, setIngredients] = useState<string[]>(
    getParamArray("ingredients", [""])
  );
  const [steps, setSteps] = useState<string[]>(
    getParamArray("steps", [""])
  );

  const handleImageUpload = (url: string) => {
    setImage(url);
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    if (imageInput) {
      imageInput.value = url;
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    if (imageInput) {
      imageInput.value = "";
    }
  };

  // Helper functions for ingredient/step management (same as in edit page)
  const updateIngredient = (idx: number, value: string) => {
    const newItems = [...ingredients];
    newItems[idx] = value;
    setIngredients(newItems);
  };

  const deleteIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const moveIngredientUp = (idx: number) => {
    if (idx === 0) return;
    const newItems = [...ingredients];
    [newItems[idx - 1], newItems[idx]] = [newItems[idx], newItems[idx - 1]];
    setIngredients(newItems);
  };

  const moveIngredientDown = (idx: number) => {
    if (idx === ingredients.length - 1) return;
    const newItems = [...ingredients];
    [newItems[idx], newItems[idx + 1]] = [newItems[idx + 1], newItems[idx]];
    setIngredients(newItems);
  };

  const updateStep = (idx: number, value: string) => {
    const newSteps = [...steps];
    newSteps[idx] = value;
    setSteps(newSteps);
  };

  const deleteStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const moveStepUp = (idx: number) => {
    if (idx === 0) return;
    const newSteps = [...steps];
    [newSteps[idx - 1], newSteps[idx]] = [newSteps[idx], newSteps[idx - 1]];
    setSteps(newSteps);
  };

  const moveStepDown = (idx: number) => {
    if (idx === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[idx], newSteps[idx + 1]] = [newSteps[idx + 1], newSteps[idx]];
    setSteps(newSteps);
  };

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
            defaultValue={getParamValue("name")}
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
            defaultValue={getParamValue("description")}
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
            defaultValue={getParamValue("author")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              defaultValue={getParamValue("servings")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              defaultValue={getParamValue("prepTime")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              defaultValue={getParamValue("cookTime")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              defaultValue={getParamValue("inactiveTime")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 hr (chilling)"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block font-bold mb-4">Ingredients</label>
          <div className="space-y-2">
            {ingredients.map((ingredient, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <IngredientInput
                  name={`ingredient-${idx}`}
                  value={ingredient}
                  onChange={(value) => updateIngredient(idx, value)}
                  placeholder="Enter ingredient..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveIngredientUp(idx)}
                    disabled={idx === 0}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveIngredientDown(idx)}
                    disabled={idx === ingredients.length - 1}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteIngredient(idx)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Ingredient
          </button>
        </div>

        {/* Steps */}
        <div>
          <label className="block font-bold mb-4">Instructions</label>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-shrink-0 pt-2">
                  <span className="font-bold text-blue-500">{idx + 1}.</span>
                </div>
                <div className="flex-1 min-w-0">
                  <textarea
                    name={`step-${idx}`}
                    value={step}
                    onChange={(e) => updateStep(idx, e.target.value)}
                    placeholder="Enter instruction..."
                    rows={Math.max(3, Math.ceil(step.length / 50))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => moveStepUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStepDown(idx)}
                    disabled={idx === steps.length - 1}
                    className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStep(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 text-sm"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Step
          </button>
        </div>

        {/* Recipe Options */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="block font-bold mb-4">Recipe Options</label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVegetarian"
                name="isVegetarian"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isVegetarian" className="ml-2 cursor-pointer">
                🥬 Vegetarian
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVegan"
                name="isVegan"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isVegan" className="ml-2 cursor-pointer">
                🌱 Vegan
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDairyFree"
                name="isDairyFree"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isDairyFree" className="ml-2 cursor-pointer">
                🥛 Dairy Free
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isGlutenFree"
                name="isGlutenFree"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isGlutenFree" className="ml-2 cursor-pointer">
                🌾 Gluten Free
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCrockPot"
                name="isCrockPot"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isCrockPot" className="ml-2 cursor-pointer">
                🍲 Crock Pot
              </label>
            </div>
          </div>
        </div>

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

