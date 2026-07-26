import { redirect } from "react-router-dom";

import Activities from "../pages/Activities/Activities";
import CRMAnalytics from "../pages/CRMAnalytics/CRMAnalytics";
import CRMDashboard from "../pages/CRMDashboard/CRMDashboard";
import CRMSettings from "../pages/CRMSettings/CRMSettings";
import Campaigns from "../pages/Campaigns/Campaigns";
import CustomerDetails from "../pages/CustomerDetails/CustomerDetails";
import CustomerForm from "../pages/CustomerForm/CustomerForm";
import Customers from "../pages/Customers/Customers";
import Loyalty from "../pages/Loyalty/Loyalty";
import Pipeline from "../pages/Pipeline/Pipeline";
import Segments from "../pages/Segments/Segments";

import { CRM_PATHS } from "./crmNavigation";

export const CRM_ROUTE_IDS = Object.freeze({
  dashboard: "crm-dashboard",
  customers: "crm-customers",
  customerCreate: "crm-customer-create",
  customerDetails: "crm-customer-details",
  customerEdit: "crm-customer-edit",
  pipeline: "crm-pipeline",
  activities: "crm-activities",
  loyalty: "crm-loyalty",
  segments: "crm-segments",
  campaigns: "crm-campaigns",
  analytics: "crm-analytics",
  settings: "crm-settings",
});

export const crmRoutes = [
  {
    id: CRM_ROUTE_IDS.dashboard,
    path: CRM_PATHS.root,
    Component: CRMDashboard,
    handle: {
      title: "CRM",
      permission: "crm.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.customers,
    path: CRM_PATHS.customers,
    Component: Customers,
    handle: {
      title: "Mijozlar",
      permission: "crm.customers.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.customerCreate,
    path: CRM_PATHS.customerCreate,
    Component: CustomerForm,
    handle: {
      title: "Yangi mijoz",
      permission: "crm.customers.create",
      mode: "create",
    },
  },
  {
    id: CRM_ROUTE_IDS.customerEdit,
    path: CRM_PATHS.customerEdit,
    Component: CustomerForm,
    handle: {
      title: "Mijozni tahrirlash",
      permission: "crm.customers.edit",
      mode: "edit",
    },
  },
  {
    id: CRM_ROUTE_IDS.customerDetails,
    path: CRM_PATHS.customerDetails,
    Component: CustomerDetails,
    handle: {
      title: "Mijoz profili",
      permission: "crm.customers.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.pipeline,
    path: CRM_PATHS.pipeline,
    Component: Pipeline,
    handle: {
      title: "Savdo voronkasi",
      permission: "crm.pipeline.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.activities,
    path: CRM_PATHS.activities,
    Component: Activities,
    handle: {
      title: "Vazifalar",
      permission: "crm.activities.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.loyalty,
    path: CRM_PATHS.loyalty,
    Component: Loyalty,
    handle: {
      title: "Sodiqlik dasturi",
      permission: "crm.loyalty.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.segments,
    path: CRM_PATHS.segments,
    Component: Segments,
    handle: {
      title: "Mijoz segmentlari",
      permission: "crm.segments.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.campaigns,
    path: CRM_PATHS.campaigns,
    Component: Campaigns,
    handle: {
      title: "Marketing kampaniyalari",
      permission: "crm.campaigns.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.analytics,
    path: CRM_PATHS.analytics,
    Component: CRMAnalytics,
    handle: {
      title: "CRM tahlillari",
      permission: "crm.analytics.view",
    },
  },
  {
    id: CRM_ROUTE_IDS.settings,
    path: CRM_PATHS.settings,
    Component: CRMSettings,
    handle: {
      title: "CRM sozlamalari",
      permission: "crm.settings.view",
    },
  },
  {
    id: "crm-legacy-dashboard-redirect",
    path: "/crm/dashboard",
    loader: () => redirect(CRM_PATHS.root),
  },
];

export const getCrmRouteById = (routeId) =>
  crmRoutes.find((route) => route.id === routeId) || null;

export default crmRoutes;
