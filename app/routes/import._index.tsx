import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Import Recipe - The Trusted Palate" },
    { name: "description", content: "Import a recipe from a website" },
  ];
};

export default function ImportIndex() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Import Recipe</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-2xl leading-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        <URLImportForm onClose={() => navigate(-1)} />
      </div>
    </div>
  );
}

function URLImportForm({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    if (!url.trim()) {
      setError("Please enter a URL");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to import recipe");
        setStatus("error");
        return;
      }

      setStatus("success");

      // Redirect to new recipe page with pre-filled data
      const recipe = data.recipe;
      const params = new URLSearchParams({
        name: recipe.name || "",
        description: recipe.description || "",
        author: recipe.author || "",
        servings: recipe.servings || "",
        prepTime: recipe.prepTime || "",
        cookTime: recipe.cookTime || "",
        inactiveTime: recipe.inactiveTime || "",
        ingredients: JSON.stringify(recipe.ingredients || []),
        steps: JSON.stringify(recipe.steps || []),
      });

      navigate(`/recipes/new?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import recipe");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipe-url" className="block text-sm font-medium mb-2 dark:text-gray-300">
          Recipe URL
        </label>
        <input
          type="url"
          id="recipe-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.allrecipes.com/recipe/..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={status === "loading"}
          autoFocus
        />
      </div>

      {status === "loading" && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm py-2">
          <span className="animate-spin">⏳</span>
          <span>Fetching and parsing recipe...</span>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded text-sm">
          <p className="font-semibold mb-1">Failed to import recipe</p>
          <p>{error}</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded text-sm">
          <p className="font-semibold">✓ Recipe imported successfully!</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {status === "loading" ? "Importing..." : "Import"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
