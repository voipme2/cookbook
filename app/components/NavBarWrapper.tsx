import React from "react";
import { NavBar } from "./NavBar";
import { Layout } from "./Layout";

export function NavBarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <NavBar />
      <main className="container mx-auto px-4 py-8 dark:bg-slate-950">{children}</main>
    </Layout>
  );
}

