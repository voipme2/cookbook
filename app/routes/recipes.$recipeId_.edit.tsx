import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { getRecipeById, updateRecipe } from "~/lib/queries/recipes";
import { ImageUploader } from "~/components/ImageUploader";
import type { Recipe } from "~/types";
import React from "react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.recipe) {
    return [{ title: "Edit Recipe - The Trusted Palate" }];
  }
  return [
    { title: `Edit ${data.recipe.name} - The Trusted Palate` },
  ];
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

  // Get form values
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const author = formData.get("author") as string;
  const servings = formData.get("servings") as string;
  const prepTime = formData.get("prepTime") as string;
  const cookTime = formData.get("cookTime") as string;
  const inactiveTime = formData.get("inactiveTime") as string;
  const image = formData.get("image") as string;
  
  // Get ingredients - they come as ingredient-0, ingredient-1, etc.
  const ingredients: string[] = [];
  let idx = 0;
  while (true) {
    const ingredient = formData.get(`ingredient-${idx}`);
    if (ingredient === null) break;
    if ((ingredient as string).trim().length > 0) {
      ingredients.push((ingredient as string).trim());
    }
    idx++;
  }
  
  // Get steps - they come as step-0, step-1, etc.
  const steps: string[] = [];
  idx = 0;
  while (true) {
    const step = formData.get(`step-${idx}`);
    if (step === null) break;
    if ((step as string).trim().length > 0) {
      steps.push((step as string).trim());
    }
    idx++;
  }
  
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
    const recipeData: Partial<Recipe> = {
      name,
      description: description || undefined,
      author: author || undefined,
      servings: servings || undefined,
      prepTime: prepTime || undefined,
      cookTime: cookTime || undefined,
      inactiveTime: inactiveTime || undefined,
      image: image || undefined,
      ingredients,
      steps,
      options,
    };

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

// Component for managing list items with add/delete/reorder
function ListItemManager({ 
  items, 
  setItems, 
  label, 
  placeholder 
}: { 
  items: string[], 
  setItems: (items: string[]) => void,
  label: string,
  placeholder: string
}) {
  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setItems([...items, ""]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  return (
    <div>
      <label className="block font-bold mb-4">{label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              name={`${label.toLowerCase().replace(/\s+/g, '-').slice(0, -1)}-${idx}`}
              value={item}
              onChange={(e) => handleChange(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === items.length - 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => handleDelete(idx)}
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
        onClick={handleAdd}
        className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        + Add {label.slice(0, -1)}
      </button>
    </div>
  );
}

// Component for steps with auto-expanding textarea
function StepsManager({
  steps,
  setSteps,
}: {
  steps: string[],
  setSteps: (steps: string[]) => void
}) {
  const handleChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleDelete = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setSteps([...steps, ""]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  return (
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
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder="Enter instruction..."
                rows={Math.max(3, Math.ceil(step.length / 50))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === steps.length - 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => handleDelete(idx)}
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
        onClick={handleAdd}
        className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        + Add Step
      </button>
    </div>
  );
}

export default function EditRecipe() {
  const { recipe } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [image, setImage] = useState<string>(recipe.image || "");
  const [ingredients, setIngredients] = useState<string[]>(recipe.ingredients || [""]);
  const [steps, setSteps] = useState<string[]>(recipe.steps || [""]);

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link to={`/recipes/${recipe.id}`} className="text-blue-500 hover:text-blue-600 mb-4 inline-block">
          ← Back to Recipe
        </Link>
        <h1 className="text-3xl font-bold">✏️ Edit Recipe</h1>
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
              defaultValue={recipe.servings || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Ingredients */}
        <ListItemManager 
          items={ingredients}
          setItems={setIngredients}
          label="Ingredients"
          placeholder="Enter ingredient..."
        />

        {/* Steps */}
        <StepsManager 
          steps={steps}
          setSteps={setSteps}
        />

        {/* Recipe Options */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="block font-bold mb-4">Recipe Options</label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isVegetarian"
                name="isVegetarian"
                defaultChecked={recipe.options?.isVegetarian || false}
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
                defaultChecked={recipe.options?.isVegan || false}
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
                defaultChecked={recipe.options?.isDairyFree || false}
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
                defaultChecked={recipe.options?.isGlutenFree || false}
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
                defaultChecked={recipe.options?.isCrockPot || false}
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
    </div>
  );
}

