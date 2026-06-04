import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";
import { useAuthStore } from "./store/authStore";
import 'leaflet/dist/leaflet.css';

import "./styles/globals.css";

function Bootstrap() {
  const initialize = useAuthStore((s) => s.initialize);

  React.useEffect(() => {
    initialize();
  }, []);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);