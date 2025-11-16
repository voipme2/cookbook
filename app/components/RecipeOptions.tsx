import type { Recipe } from "~/types";

interface RecipeOptionsProps {
  options?: Recipe["options"];
  variant?: "inline" | "block";
}

export function RecipeOptions({ options, variant = "inline" }: RecipeOptionsProps) {
  if (!options) return null;

  const activeOptions = [
    options.isVegetarian && { icon: "🥬", label: "Vegetarian" },
    options.isVegan && { icon: "🌱", label: "Vegan" },
    options.isDairyFree && { icon: "🥛", label: "Dairy Free" },
    options.isGlutenFree && { icon: "🌾", label: "Gluten Free" },
    options.isCrockPot && { icon: "🍲", label: "Crock Pot" },
  ].filter(Boolean) as Array<{ icon: string; label: string }>;

  if (activeOptions.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2">
        {activeOptions.map((option) => (
          <span
            key={option.label}
            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeOptions.map((option) => (
        <div key={option.label} className="flex items-center gap-2 text-sm">
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </div>
      ))}
    </div>
  );
}

