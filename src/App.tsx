import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Dashboard } from "@/pages/Dashboard";
import { Practice } from "@/pages/Practice";
import { Login } from "@/pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
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
