import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { createGroup } from "~/lib/queries/groups";

export const meta: MetaFunction = () => {
  return [
    { title: "New Group - The Trusted Palate" },
    { name: "description", content: "Create a new recipe group" },
  ];
};

interface ActionData {
  errors?: {
    name?: string;
    general?: string;
  };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json<ActionData>(
      { errors: { general: "Method not allowed" } },
      { status: 405 }
    );
  }

  const formData = await request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Validation
  if (!name || name.trim().length === 0) {
    return json<ActionData>(
      { errors: { name: "Group name is required" } },
      { status: 400 }
    );
  }

  try {
    const groupId = await createGroup({
      name,
      description: description || undefined,
    });

    return redirect(`/groups/${groupId}`);
  } catch (error) {
    console.error("Failed to create group:", error);
    return json<ActionData>(
      { errors: { general: "Failed to create group. Please try again." } },
      { status: 500 }
    );
  }
}

export default function NewGroup() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          to="/groups"
          className="text-blue-500 hover:text-blue-600 mb-4 inline-block"
        >
          ← Back to Groups
        </Link>
        <h1 className="text-3xl font-bold">Create New Group</h1>
      </div>

      {actionData?.errors?.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {actionData.errors.general}
        </div>
      )}

      <Form method="post" className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block font-bold mb-2">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              actionData?.errors?.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="e.g., Breakfast Recipes, Quick Weeknight Dinners"
          />
          {actionData?.errors?.name && (
            <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block font-bold mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional: Describe this group of recipes"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
          <Link
            to="/groups"
            className="flex-1 text-center bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}

