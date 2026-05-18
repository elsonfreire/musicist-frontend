import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Dashboard } from "@/pages/Dashboard";
import { Practice } from "@/pages/Practice";
import { Register } from "@/pages/Register";
import { Login } from "@/pages/Login";
import { Community } from "@/pages/Community";
import { EditUser } from "@/pages/EditUser";
import { Forum } from "@/pages/Forum";
import { Goals } from "@/pages/Goals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/edit-user",
    element: <EditUser />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/practice",
    element: <Practice />,
  },
  {
    path: "/goals", 
    element: <Goals />,
  },
  {
    path: "/community",
    element: <Community />,
  },
  {
    path: "/forum",
    element: <Forum />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
