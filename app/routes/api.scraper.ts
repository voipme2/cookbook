import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { scraper } from "~/lib/scraper";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch and parse the recipe
    const recipe = await scraper.fetch(url);

    return json({
      success: true,
      recipe,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
