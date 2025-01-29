import React from "react";

import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";

export const Layout = () => {
  const location = useLocation();
  return (
    <div>
      <NavBar showSearch={location.pathname !== "/"} />
      <Outlet />
    </div>
  );
};
