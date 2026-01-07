/**
 * Shared utilities for recipe form handling
 * Used by both create and edit recipe routes
 */

import type { Recipe } from "~/types";

/**
 * Recipe options configuration
 * Centralized definition for all recipe dietary/cooking options
 */
export const RECIPE_OPTIONS = [
  { id: "isVegetarian", label: "Vegetarian", emoji: "🥬" },
  { id: "isVegan", label: "Vegan", emoji: "🌱" },
  { id: "isDairyFree", label: "Dairy Free", emoji: "🥛" },
  { id: "isGlutenFree", label: "Gluten Free", emoji: "🌾" },
  { id: "isCrockPot", label: "Crock Pot", emoji: "🍲" },
] as const;

export type RecipeOptionId = typeof RECIPE_OPTIONS[number]["id"];

/**
 * Helper function to get a single value from form data or URL params
 */
export function getValue(
  formData: FormData,
  searchParams: URLSearchParams,
  key: string
): string {
  const formValue = formData.get(key);
  if (formValue) return formValue as string;
  return searchParams.get(key) || "";
}

/**
 * Helper function to get array values from form data
 * Handles both JSON arrays from URL params and newline-separated values from form data
 */
export function getArrayValue(
  formData: FormData,
  searchParams: URLSearchParams,
  key: string
): string[] {
  const formValue = formData.get(key);
  const urlValue = searchParams.get(key);
  const value = formValue || urlValue;

  if (!value) return [];

  try {
    // Try to parse as JSON first (from URL params)
    const parsed = JSON.parse(value as string);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
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
}

/**
 * Extract indexed form values (e.g., ingredient-0, ingredient-1, etc.)
 * @param formData - The form data to extract from
 * @param prefix - The prefix for the indexed fields (e.g., "ingredient", "step")
 * @returns Array of non-empty values
 */
export function extractIndexedFormValues(
  formData: FormData,
  prefix: string
): string[] {
  const values: string[] = [];
  let idx = 0;

  while (true) {
    const value = formData.get(`${prefix}-${idx}`);
    if (value === null) break;
    if ((value as string).trim().length > 0) {
      values.push((value as string).trim());
    }
    idx++;
  }

  return values;
}

/**
 * Extract recipe options from form data
 */
export function extractRecipeOptions(formData: FormData): Recipe["options"] {
  return {
    isVegetarian: formData.get("isVegetarian") === "on",
    isVegan: formData.get("isVegan") === "on",
    isDairyFree: formData.get("isDairyFree") === "on",
    isGlutenFree: formData.get("isGlutenFree") === "on",
    isCrockPot: formData.get("isCrockPot") === "on",
  };
}

/**
 * Build recipe data object from form values
 * @param formData - The form data
 * @param searchParams - URL search params (for pre-filled values from scraper)
 * @returns Recipe data object ready for creation/update
 */
export function buildRecipeData(
  formData: FormData,
  searchParams: URLSearchParams = new URLSearchParams()
): Omit<Recipe, "id"> {
  const name = getValue(formData, searchParams, "name");
  const description = getValue(formData, searchParams, "description");
  const author = getValue(formData, searchParams, "author");
  const servings = getValue(formData, searchParams, "servings");
  const prepTime = getValue(formData, searchParams, "prepTime");
  const cookTime = getValue(formData, searchParams, "cookTime");
  const inactiveTime = getValue(formData, searchParams, "inactiveTime");
  const difficulty = getValue(formData, searchParams, "difficulty");
  const notes = getValue(formData, searchParams, "notes");
  const source = getValue(formData, searchParams, "source");
  const image = getValue(formData, searchParams, "image");

  const ingredients = extractIndexedFormValues(formData, "ingredient");
  const steps = extractIndexedFormValues(formData, "step");
  const options = extractRecipeOptions(formData);

  return {
    name,
    description: description || undefined,
    author: author || undefined,
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
}

/**
 * Validate recipe data
 * @returns Error object if validation fails, null otherwise
 */
export function validateRecipeData(
  data: Omit<Recipe, "id">
): { name?: string } | null {
  if (!data.name || data.name.trim().length === 0) {
    return { name: "Recipe name is required" };
  }
  return null;
}

/**
 * Parse URL search params for pre-filled form values (from scraper)
 */
export function getParamValue(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = ""
): string {
  const value = searchParams.get(key);
  return value || defaultValue;
}

/**
 * Parse URL search params for array values (from scraper)
 */
export function getParamArray(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string[] = []
): string[] {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}
