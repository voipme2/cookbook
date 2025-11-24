import { useState } from "react";
import { Printer } from "lucide-react";
import { Link } from "@remix-run/react";
import type { ShoppingListItem } from "~/lib/shopping-list";
import type { Recipe } from "~/types";

interface ShoppingListProps {
  items: ShoppingListItem[];
  title?: string;
  printUrl?: string;
  backUrl?: string;
  recipes?: Recipe[];
}

export function ShoppingList({ items, title = "Shopping List", printUrl, backUrl, recipes }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItemCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-slate-400">
          No ingredients found in recipes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">
          {title}
        </h2>
        {printUrl && (
          <div className="flex gap-2">
            <Link
              to={printUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Printer size={18} />
              Print Shopping List
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 flex gap-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Ingredients
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {items.length}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">Checked</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {checkedItems.size}
          </p>
        </div>
      </div>

      {/* Shopping list items */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isChecked = checkedItems.has(index);

          return (
            <div
              key={`${item.item}-${index}`}
              className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItemCheck(index)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-lg capitalize ${
                      isChecked
                        ? "line-through text-gray-400 dark:text-slate-500"
                        : "text-gray-800 dark:text-slate-100"
                    }`}
                  >
                    {item.item}
                  </p>

                  {/* Show measurements from each recipe */}
                  {item.entries.length > 0 && (
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-slate-400 pl-3 border-l-2 border-gray-200 dark:border-slate-600">
                      {item.entries.map((entry, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <p className="font-medium text-gray-700 dark:text-slate-300">{entry.recipe}</p>
                          <p className="text-gray-600 dark:text-slate-400 italic">
                            "{entry.ingredient}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

