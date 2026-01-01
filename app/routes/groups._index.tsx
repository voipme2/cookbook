import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { useLoaderData, Link } from "@remix-run/react";
import type { Group } from "~/types";
import { getAllGroups, getGroupRecipeCount } from "~/lib/queries/groups";

export const meta: MetaFunction = () => {
  return [
    { title: "Groups - The Trusted Palate" },
    { name: "description", content: "Organize recipes into groups" },
  ];
};

interface LoaderData {
  groups: (Group & { recipeCount: number })[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const groups = await getAllGroups();

  // Get recipe count for each group
  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => ({
      ...group,
      recipeCount: await getGroupRecipeCount(group.id),
    }))
  );

  return json<LoaderData>({
    groups: groupsWithCounts,
  });
}

export default function GroupsIndex() {
  const { groups } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Link
          to="/groups/new"
          className="bg-green-500 hover:bg-green-600 text-white dark:text-white px-4 py-2 rounded-lg font-semibold"
        >
          + New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No groups yet. Create one to get started!
          </p>
          <Link
            to="/groups/new"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white dark:text-white px-6 py-2 rounded-lg font-semibold"
          >
            Create First Group
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: Group & { recipeCount: number } }) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <h3 className="font-bold text-lg mb-2">{group.name}</h3>
      {group.description && (
        <p className="text-gray-600 text-sm mb-3">{group.description}</p>
      )}
      <div className="text-sm text-gray-500">
        {group.recipeCount === 0 ? (
          <span>No recipes</span>
        ) : (
          <span>
            {group.recipeCount} recipe{group.recipeCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Link>
  );
}

