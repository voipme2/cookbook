import { useNavigation } from "@remix-run/react";

export function LoadingIndicator() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse z-50"></div>
  );
}

