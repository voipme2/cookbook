import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const AppTitle = ({ recipeName }: { recipeName?: string }) => {
  const location = useLocation();

  useEffect(() => {
    if (recipeName) {
      document.title = `${recipeName} - the trusted palette`;
    } else {
      document.title = "the trusted palette";
    }
  }, [recipeName, location.pathname]);

  return null; // This component doesn't render anything
};
