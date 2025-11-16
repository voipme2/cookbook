// Recipe Types
// Note: Recipe data is stored as JSONB in database, this is the TypeScript representation
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  author?: string;
  source?: string;
  servings?: string; // Stored as string (e.g., "4", "4-6", "Makes 12")
  prepTime?: string; // Duration string (e.g., "15 min", "1 hr 30 min")
  inactiveTime?: string; // Waiting time
  cookTime?: string; // Duration string
  totalTime?: string; // Computed, not stored
  ingredients?: string[]; // Array of ingredient strings
  steps?: string[]; // Array of step strings
  difficulty?: string; // Easy, Medium, Hard
  image?: string; // Image URL or path
  options?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isDairyFree?: boolean;
    isGlutenFree?: boolean;
    isCrockPot?: boolean;
    [key: string]: any;
  };
  imageUrl?: string;
  notes?: string;
  groups?: Array<{ id: string; name: string }>;
  [key: string]: any; // Allow other fields from JSONB
}

export interface RecipeIngredient {
  text: string;
  quantity?: string;
  unit?: string;
}

export interface RecipeStep {
  number: number;
  instruction: string;
}

// Group Types
export interface RecipeGroup {
  id: string;
  name: string;
  description?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Image Types
export interface Image {
  id: string;
  recipeId: string;
  filename: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  uploadedAt: Date;
}

// Search & Filter Types
export interface SearchParams {
  q?: string;
  group?: string;
  page?: number;
  limit?: number;
}

export interface SearchResults {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
}

// Import/Export Types
export interface ImportRecipePayload {
  url?: string;
  name: string;
  source?: string;
  ingredients: string;
  steps: string;
  notes?: string;
  groupId?: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
}

// UI Types
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface FormError {
  field: string;
  message: string;
}

