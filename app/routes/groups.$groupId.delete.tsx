import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { deleteGroup } from "~/lib/queries/groups";

export async function action({ request, params }: ActionFunctionArgs) {
  const { groupId } = params;

  if (!groupId) {
    throw new Response("Group ID is required", { status: 400 });
  }

  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  try {
    await deleteGroup(groupId);
    return redirect("/groups");
  } catch (error) {
    console.error("Failed to delete group:", error);
    throw new Response("Failed to delete collection", { status: 500 });
  }
}

