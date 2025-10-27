import {
  Home as HomeIcon, Settings as SettingsIcon, LayoutGrid, Briefcase,
  Calculator, Calendar, Users, Inbox, Plug, FileText, BadgeDollarSign, DollarSign
} from "lucide-react";

export type NavNode = {
  label: string;
  href?: string;
  icon?: any;
  comingSoon?: boolean;
  children?: NavNode[];
};

export const NAV: NavNode[] = [
  // Home (no dropdown)
  { label: "Home", href: "/home", icon: HomeIcon },

  // Accounting — ONLY dropdown with sub-tabs
  {
    label: "Accounting",
    children: [
      {
        label: "RFQs",
        children: [
          { label: "View RFQs", href: "/accounting/rfqs/view", icon: FileText },
          { label: "Create RFQ", href: "/accounting/rfqs/create", icon: FileText },
        ],
      },
      {
        label: "Purchase Orders",
        children: [
          { label: "Fabricator POs — View", href: "/accounting/pos/fabricator/view", icon: FileText },
          { label: "Installer POs — View", href: "/accounting/pos/installer/view", icon: FileText },
        ],
      },
      {
        label: "Change Orders",
        children: [
          { label: "View Change Orders", href: "/accounting/change-orders/view", icon: FileText },
          { label: "Create Change Order", href: "/accounting/change-orders/create", icon: FileText },
        ],
      },
      {
        label: "Payments",
        children: [
          { label: "View Payments", href: "/accounting/payments/view", icon: DollarSign },
        ],
      },
      {
        label: "Receivables",
        children: [
          { label: "Summary", href: "/accounting/receivables/summary", icon: DollarSign },
          { label: "Requisition Log", href: "/accounting/receivables/requisition-log", icon: FileText },
          { label: "Liens & Disputes", href: "/accounting/receivables/liens-disputes", icon: FileText },
          { label: "Closeouts", href: "/accounting/receivables/closeouts", icon: FileText },
        ],
      },
      {
        label: "Monthly Bills",
        children: [
          { label: "Auto Pay", href: "/accounting/monthly-bills/autopay", icon: BadgeDollarSign },
          { label: "Subcontractors", href: "/accounting/monthly-bills/subcontractors", icon: Users },
          { label: "Materials", href: "/accounting/monthly-bills/materials", icon: FileText },
        ],
      },
      {
        label: "Vendors",
        children: [
          { label: "View Vendors", href: "/accounting/vendors/view", icon: Users },
        ],
      },
    ],
  },

  // Settings stands alone (not inside Accounting)
  { label: "Settings", href: "/settings", icon: SettingsIcon },

  // Everything else = Coming Soon (flat)
  { label: "Dashboards", href: "/dashboards", icon: LayoutGrid, comingSoon: true },
  { label: "Projects", href: "/projects", icon: Briefcase, comingSoon: true },
  { label: "Estimating", href: "/estimating", icon: Calculator, comingSoon: true },
  { label: "Calendar", href: "/calendar", icon: Calendar, comingSoon: true },
  { label: "HR", href: "/hr", icon: Users, comingSoon: true },
  { label: "Admin", href: "/admin", icon: SettingsIcon, comingSoon: true },
  { label: "Smart Inbox", href: "/smart-inbox", icon: Inbox, comingSoon: true },
  { label: "Integrations", href: "/integrations", icon: Plug, comingSoon: true },
];
