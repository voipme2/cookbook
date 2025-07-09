import React from "react";
import { Ingredient } from "@/types";

const Ingredients = ({ ingredients }: { ingredients: Ingredient[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
        Ingredients
      </h3>
      <div className="space-y-2">
        {ingredients.map((i: Ingredient, idx: number) => (
          <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-gray-900 dark:text-white">
              {i.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ingredients; 