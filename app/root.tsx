import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { NavBarWrapper } from "~/components/NavBarWrapper";
import { LoadingIndicator } from "~/components/LoadingIndicator";
import "./root.css";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
];

// Script to prevent flash of unstyled content (FOUC) on theme change
const themeScript = `
  (function() {
    const theme = localStorage.getItem('cookbook-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = theme || (prefersDark ? 'dark' : 'light');
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        <LoadingIndicator />
        <NavBarWrapper>
          <Outlet />
        </NavBarWrapper>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

