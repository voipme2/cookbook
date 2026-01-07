import { IngredientInput } from "./IngredientInput";

interface ListItemManagerProps {
  items: string[];
  setItems: (items: string[]) => void;
  label: string;
  placeholder: string;
  fieldPrefix: string;
}

/**
 * Reusable component for managing a list of items with add/delete/reorder functionality
 * Used for ingredients in recipe forms
 */
export function ListItemManager({
  items,
  setItems,
  label,
  placeholder,
  fieldPrefix,
}: ListItemManagerProps) {
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

  const isIngredients = fieldPrefix === "ingredient";
  const singularLabel = label.endsWith("s") ? label.slice(0, -1) : label;

  return (
    <div>
      <label className="block font-bold mb-4">{label}</label>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {isIngredients ? (
              <IngredientInput
                name={`${fieldPrefix}-${idx}`}
                value={item}
                onChange={(value) => handleChange(idx, value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              />
            ) : (
              <input
                type="text"
                name={`${fieldPrefix}-${idx}`}
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === items.length - 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        + Add {singularLabel}
      </button>
    </div>
  );
}

interface StepsManagerProps {
  steps: string[];
  setSteps: (steps: string[]) => void;
}

/**
 * Specialized component for managing recipe steps/instructions
 * Uses textarea inputs that auto-expand based on content length
 */
export function StepsManager({ steps, setSteps }: StepsManagerProps) {
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 resize-none"
              />
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === steps.length - 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
