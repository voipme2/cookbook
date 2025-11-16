import { Link } from "@remix-run/react";
import { ChefHat, Moon, Sun } from "lucide-react";
import { useTheme } from "~/lib/theme-context";

export function NavBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity flex-shrink-0">
            <ChefHat size={28} className="text-orange-500" />
            <span className="hidden sm:inline">The Trusted Palate</span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-2 flex-wrap justify-end">
            <Link 
              to="/recipes" 
              className="px-2 sm:px-3 py-2 text-xs sm:text-base rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Recipes
            </Link>
            <Link 
              to="/groups" 
              className="px-2 sm:px-3 py-2 text-xs sm:text-base rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Groups
            </Link>
            <Link 
              to="/import" 
              className="px-2 sm:px-3 py-2 text-xs sm:text-base rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Import
            </Link>
            <Link 
              to="/recipes/new" 
              className="px-2 sm:px-4 py-2 text-xs sm:text-base rounded-lg bg-green-500 hover:bg-green-600 text-gray-900 font-semibold transition-colors whitespace-nowrap flex-shrink-0"
            >
              + New
            </Link>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ml-1 flex-shrink-0"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

