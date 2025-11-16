import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteRecipe } from "~/lib/queries/recipes";

export async function action({ request, params }: ActionFunctionArgs) {
  const { recipeId } = params;

  if (!recipeId) {
    throw new Response("Recipe ID is required", { status: 400 });
  }

  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  try {
    await deleteRecipe(recipeId);
    return redirect("/recipes");
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    throw new Response("Failed to delete recipe", { status: 500 });
  }
}

