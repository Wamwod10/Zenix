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
import Products from "../../features/products/pages/Products";
import Warehouse from "../../features/warehouse/pages/Warehouse";
import Finance from "../../features/finance/pages/Finance";
import { FinanceRouteError } from "../../features/finance/components/FinanceErrorBoundary/FinanceErrorBoundary";
import HR from "../../features/hr/pages/HR";
import Reports from "../../features/reports/pages/Reports";
import Settings from "../../features/settings/pages/Settings";
import { crmRoutes } from "../../features/crm/config/crmRoutes";
import PurchasesLayout from "../../features/purchases/layouts/PurchasesLayout/PurchasesLayout";
import PurchasesDashboard from "../../features/purchases/pages/PurchasesDashboard/PurchasesDashboard";
import PurchaseOrders from "../../features/purchases/pages/PurchaseOrders/PurchaseOrders";
import PurchaseOrderCreate from "../../features/purchases/pages/PurchaseOrderCreate/PurchaseOrderCreate";
import PurchaseOrderDetail from "../../features/purchases/pages/PurchaseOrderDetail/PurchaseOrderDetail";
import GoodsReceiving from "../../features/purchases/pages/GoodsReceiving/GoodsReceiving";
import QualityInspections from "../../features/purchases/pages/QualityInspections/QualityInspections";
import PurchaseReturns from "../../features/purchases/pages/PurchaseReturns/PurchaseReturns";
import PurchaseInvoices from "../../features/purchases/pages/PurchaseInvoices/PurchaseInvoices";
import PurchaseReports from "../../features/purchases/pages/PurchaseReports/PurchaseReports";
import { SupplierDetails, Suppliers } from "../../features/suppliers";

import POS from "../../features/sales/pages/POS";
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
      {
        path: "/pos",
        element: <POS />,
      },
      {
        path: "/products/*",
        element: <Products />,
      },
      {
        path: "/warehouse/*",
        element: <Warehouse />,
      },
      {
        path: "/purchases",
        element: <PurchasesLayout />,
        children: [
          {
            index: true,
            element: <PurchasesDashboard />,
          },
          {
            path: "orders",
            element: <PurchaseOrders />,
          },
          {
            path: "orders/new",
            element: <PurchaseOrderCreate />,
          },
          {
            path: "orders/:orderId",
            element: <PurchaseOrderDetail />,
          },
          {
            path: "receiving",
            element: <GoodsReceiving />,
          },
          {
            path: "quality-inspection",
            element: <QualityInspections />,
          },
          {
            path: "returns",
            element: <PurchaseReturns />,
          },
          {
            path: "invoices",
            element: <PurchaseInvoices />,
          },
          {
            path: "reports",
            element: <PurchaseReports />,
          },
        ],
      },
      {
        path: "/suppliers",
        element: <Suppliers />,
      },
      {
        path: "/suppliers/:supplierId",
        element: <SupplierDetails />,
      },
      {
        path: "/finance/*",
        element: <Finance />,
        errorElement: <FinanceRouteError />,
      },
      {
        path: "/hr/*",
        element: <HR />,
      },
      {
        path: "/reports/*",
        element: <Reports />,
      },
      {
        path: "/settings/*",
        element: <Settings />,
      },
      {
        path: "/inventory",
        element: <Navigate to="/warehouse" replace />,
      },

      ...crmRoutes,
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
