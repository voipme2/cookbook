import { RECIPE_OPTIONS } from "~/lib/recipe-form.utils";

interface RecipeOptionsCheckboxesProps {
  defaultValues?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isDairyFree?: boolean;
    isGlutenFree?: boolean;
    isCrockPot?: boolean;
  };
}

/**
 * Reusable component for recipe dietary/cooking option checkboxes
 * Used in both create and edit recipe forms
 */
export function RecipeOptionsCheckboxes({
  defaultValues = {},
}: RecipeOptionsCheckboxesProps) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-slate-800 dark:border-slate-600">
      <label className="block font-bold mb-4">Recipe Options</label>
      <div className="space-y-3">
        {RECIPE_OPTIONS.map(({ id, label, emoji }) => (
          <div key={id} className="flex items-center">
            <input
              type="checkbox"
              id={id}
              name={id}
              defaultChecked={defaultValues[id] || false}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor={id} className="ml-2 cursor-pointer">
              {emoji} {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
