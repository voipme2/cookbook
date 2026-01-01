import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/server-runtime";

export async function loader({ }: LoaderFunctionArgs) {
  // Redirect to recipes page
  throw redirect("/recipes");
}

