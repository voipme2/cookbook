import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white dark:bg-slate-950">{children}</div>;
}

