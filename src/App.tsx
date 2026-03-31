import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Dashboard } from "@/pages/Dashboard";
import { Practice } from "@/pages/Practice";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/practice",
    element: <Practice />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
