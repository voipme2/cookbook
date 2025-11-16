import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { searchRecipes } from "~/lib/queries/recipes";

export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const results = await searchRecipes(query);
    return json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

