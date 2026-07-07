import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import EmailVerification from "../../features/auth/pages/EmailVerification";

import BusinessType from "../../features/onboarding/pages/BusinessType";
import BusinessSetup from "../../features/onboarding/pages/BusinessSetup";
import Pricing from "../../features/onboarding/pages/Pricing";
import PaymentCard from "../../features/onboarding/pages/PaymentCard";
import AIPreparing from "../../features/onboarding/pages/AIPreparing";

import Dashboard from "../../features/dashboard/pages/Dashboard";
import NotFound from "../../pages/NotFound";

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
    path: "/pricing",
    element: <Pricing />,
  },

  {
    path: "/payment-card",
    element: <PaymentCard />,
  },

  {
    path: "/ai-preparing",
    element: <AIPreparing />,
  },

  {
    element: <DashboardLayout />,

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
