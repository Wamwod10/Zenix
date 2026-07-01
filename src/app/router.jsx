import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "../components/layout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import BusinessType from "../features/onboarding/pages/BusinessType";
import BusinessSetup from "../features/onboarding/pages/BusinessSetup";
import NotFound from "../pages/NotFound";
import EmailVerification from "../features/auth/pages/EmailVerification";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/email-verification",
    element: <EmailVerification />,
  },

  {
    path: "/business-type",
    element: <BusinessType />,
  },

  {
    path: "/business-setup",
    element: <BusinessSetup />,
  },

  {
    element: <AppShell />,

    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
