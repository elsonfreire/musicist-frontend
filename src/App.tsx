import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Dashboard } from "@/pages/Dashboard";
import { Practice } from "@/pages/Practice";
import { Register } from "@/pages/Register";
import { Login } from "@/pages/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />
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
