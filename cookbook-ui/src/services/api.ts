import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { Recipe, SearchRecipe } from "../types";

const fetchRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch("/api/recipes");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const searchRecipes = async (query: string): Promise<SearchRecipe[]> => {
  const response = await fetch(`/api/search?query=${query}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchRecipeById = async (id: string): Promise<Recipe> => {
  const response = await fetch(`/api/recipes/${id}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const saveRecipe = async (recipe: Partial<Recipe>): Promise<Recipe> => {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const updateRecipe = async ({
  id,
  ...recipe
}: Partial<Recipe> & { id: string }): Promise<Recipe> => {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const deleteRecipe = async (id: string) => {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchRecipeByUrl = async (recipeUrl: string) => {
  const response = await fetch(`/api/fetch/?recipeUrl=${recipeUrl}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const fetchRecipeFromUrl = async (url: string): Promise<Recipe> => {
  const response = await fetch("/api/recipes/fetch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch recipe from URL");
  }
  return response.json();
};

export const useGetRecipesQuery = (): UseQueryResult<Recipe[]> => {
  return useQuery({ queryKey: ["recipes"], queryFn: fetchRecipes });
};

export const useSearchQuery = (
  query: string,
): UseQueryResult<SearchRecipe[]> => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchRecipes(query),
    enabled: !!query,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  });
};

export const useGetOneQuery = (id: string): UseQueryResult<Recipe> => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipeById(id),
  });
};

export const useSaveRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Partial<Recipe>, Error, Partial<Recipe>>({
    mutationFn: saveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
};

export const useUpdateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Recipe, Error, Partial<Recipe> & { id: string }>({
    mutationFn: updateRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useDeleteRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] });
    },
  });
};

export const useFetchRecipeQuery = (
  recipeUrl: string,
): UseQueryResult<Recipe> => {
  return useQuery({
    queryKey: ["fetchRecipe", recipeUrl],
    queryFn: () => fetchRecipeByUrl(recipeUrl),
  });
};
