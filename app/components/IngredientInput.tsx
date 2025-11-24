import { useState, useRef, useEffect } from "react";
import { parseIngredient } from "~/lib/shopping-list";

interface IngredientInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  name?: string;
}

// Common ingredient suggestions for autocomplete
const COMMON_INGREDIENTS = [
  "flour", "sugar", "salt", "pepper", "butter", "eggs", "milk", "cream",
  "onion", "garlic", "tomatoes", "carrots", "celery", "potatoes",
  "chicken", "beef", "pork", "fish", "shrimp",
  "olive oil", "vegetable oil", "coconut oil",
  "baking powder", "baking soda", "yeast", "vanilla extract",
  "lemon juice", "lime juice", "vinegar", "soy sauce",
  "rice", "pasta", "bread", "cheese", "parmesan",
  "basil", "oregano", "thyme", "rosemary", "parsley", "cilantro",
  "chocolate", "cocoa powder", "cinnamon", "nutmeg",
  "broth", "stock", "water", "wine", "beer"
];

// Common unit suggestions
const COMMON_UNITS = [
  "cup", "cups", "c.", "tablespoon", "tablespoons", "tbsp", "tbs",
  "teaspoon", "teaspoons", "tsp", "ounce", "ounces", "oz",
  "pound", "pounds", "lb", "lbs", "gram", "grams", "g",
  "clove", "cloves", "piece", "pieces", "can", "cans", "package", "packages"
];

export function IngredientInput({
  value,
  onChange,
  placeholder = "Enter ingredient...",
  className = "",
  name,
}: IngredientInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [parsedPreview, setParsedPreview] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Parse ingredient and show preview
  useEffect(() => {
    if (value.trim()) {
      try {
        const parsed = parseIngredient(value);
        const parts: string[] = [];
        if (parsed.quantity !== undefined) {
          parts.push(`${parsed.quantity}`);
        }
        if (parsed.unit) {
          parts.push(parsed.unit);
        }
        parts.push(parsed.item);
        setParsedPreview(parts.join(" "));
      } catch {
        setParsedPreview("");
      }
    } else {
      setParsedPreview("");
    }
  }, [value]);

  // Generate suggestions based on input
  const generateSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerInput = input.toLowerCase();
    const inputWords = lowerInput.split(/\s+/);
    const lastWord = inputWords[inputWords.length - 1];

    // If the last word looks like a unit, suggest units
    if (lastWord.length > 0 && lastWord.length <= 4) {
      const unitMatches = COMMON_UNITS.filter(unit =>
        unit.toLowerCase().startsWith(lastWord)
      );
      if (unitMatches.length > 0) {
        const prefix = inputWords.slice(0, -1).join(" ");
        setSuggestions(
          unitMatches.slice(0, 5).map(unit => 
            prefix ? `${prefix} ${unit}` : unit
          )
        );
        return;
      }
    }

    // Otherwise suggest ingredients
    const ingredientMatches = COMMON_INGREDIENTS.filter(ingredient =>
      ingredient.toLowerCase().includes(lowerInput)
    );
    setSuggestions(ingredientMatches.slice(0, 8));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    generateSuggestions(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.trim()) {
      generateSuggestions(value);
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full ${className} ${
          parsedPreview ? "border-green-300" : ""
        }`}
        aria-label="Ingredient input"
      />
      
      {/* Parsed preview */}
      {parsedPreview && value.trim() && (
        <div className="text-xs text-gray-500 mt-1 px-1">
          <span className="font-semibold">Preview:</span> {parsedPreview}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 ${
                idx === selectedIndex
                  ? "bg-blue-100 dark:bg-slate-700"
                  : ""
              } ${idx === 0 ? "rounded-t-lg" : ""} ${
                idx === suggestions.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Format hint */}
      {!value.trim() && (
        <div className="text-xs text-gray-400 mt-1 px-1">
          Format: quantity unit ingredient (e.g., "2 cups flour" or "1 tsp salt")
        </div>
      )}
    </div>
  );
}

