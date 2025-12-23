import type { Recipe } from "~/types";

interface RecipeOptionsProps {
  options?: Recipe["options"];
  variant?: "inline" | "block";
}

// Color scheme for each tag type
const tagColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  "Vegetarian": {
    bg: "bg-green-100",
    text: "text-green-800",
    darkBg: "dark:bg-green-900",
    darkText: "dark:text-green-200",
  },
  "Vegan": {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    darkBg: "dark:bg-emerald-900",
    darkText: "dark:text-emerald-200",
  },
  "Dairy Free": {
    bg: "bg-blue-100",
    text: "text-blue-800",
    darkBg: "dark:bg-blue-900",
    darkText: "dark:text-blue-200",
  },
  "Gluten Free": {
    bg: "bg-amber-100",
    text: "text-amber-800",
    darkBg: "dark:bg-amber-900",
    darkText: "dark:text-amber-200",
  },
  "Crock Pot": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    darkBg: "dark:bg-orange-900",
    darkText: "dark:text-orange-200",
  },
};

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

  const tagClassName = (label: string) => {
    const colors = tagColors[label];
    return `inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-normal ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`;
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2">
        {activeOptions.map((option) => (
          <span
            key={option.label}
            className={tagClassName(option.label)}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {activeOptions.map((option) => (
        <span
          key={option.label}
          className={tagClassName(option.label)}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </span>
      ))}
    </div>
  );
}

