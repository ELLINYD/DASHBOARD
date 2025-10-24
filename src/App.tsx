import React, { useMemo, useState, useEffect, useRef, forwardRef } from "react";
import {
  Home,
  Building,
  FileText,
  ShoppingCart,
  FileEdit,
  Calendar,
  Users,
  Search as SearchIcon,
  Plus,
  Eye,
  Factory,
  Wrench,
  ChevronDown,
  Printer,
  BadgeDollarSign,
  X,
} from "lucide-react";
import { FabricatorPOCreateView, InstallerPOCreateView, ChangeOrderCreateView } from "./po_forms";

/**
 * ELLI V1 — Monochrome Edition (AP/AR)
 * Fixes:
 * - Resolved unterminated expression in JSX (Closed/Active status cell)
 * - Corrected regex literals and string escapes in UploadDrawer parser
 * - Hardened CSV/TSV parsing without unsafe RegExp construction
 * - Integrated RFQ functionality into main dashboard
 */

// ==========================
// Formatters & Helpers
// ==========================
const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const pct = (n: number) => `${n.toFixed(1)}%`;

const formatDate = (str: string) => {
  if (!str) return "";
  const d = /\d{4}-\d{2}-\d{2}/.test(str) ? new Date(str + "T00:00:00") : new Date(str);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
};

function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Word-compatible .doc (HTML) download
function downloadAsDoc(rfq: any) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${rfq.id}</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;color:#000} .h{font-weight:700;font-size:18px} .sec{border:1px solid #000;border-radius:10px;margin:12px 0} .sec h5{margin:0;padding:6px 10px;border-bottom:1px solid #000;background:#f2f2f2;font-size:12px} .row{padding:10px;font-size:14px;white-space:pre-wrap}</style>
  </head><body>
  <div class="h">REQUEST FOR QUOTATION (RFQ)</div>
  <div style="margin:6px 0 12px;color:#333;font-size:11px">ELLI NY DESIGN • 51-05 Flushing Ave, Maspeth, NY 11378 • 718-418-9002</div>
  <div class="sec"><h5>Header</h5><div class="row"><b>RFQ #:</b> ${rfq.id}<br/><b>Project:</b> ${rfq.projectId} — ${rfq.projectName}<br/><b>Vendor:</b> ${rfq.toVendor} ${rfq.attention?`(Attn: ${rfq.attention})`:``}<br/><b>Email:</b> ${rfq.email||""} <b>Phone:</b> ${rfq.phone||""}<br/><b>Due Date:</b> ${formatDate(rfq.dueDate)} &nbsp; <b>Terms:</b> ${rfq.terms} &nbsp; <b>Status:</b> ${rfq.status}</div></div>
  <div class="sec"><h5>Title / Heading</h5><div class="row">${rfq.title||"(Untitled RFQ)"}</div></div>
  <div class="sec"><h5>Scope of Work / Pricing Matrix</h5><div class="row">${(rfq.scope||"").replace(/\n/g,"<br/>")}</div></div>
  <div class="sec"><h5>Notes / Clarifications</h5><div class="row">${(rfq.notes||"").replace(/\n/g,"<br/>")}</div></div>
  <div style="margin-top:12px;font-size:11px;display:flex;justify-content:space-between"><span>Prepared by: ELLI NY DESIGN — estimating@elli.example</span><span>Date: ${formatDate(new Date().toISOString().slice(0,10))}</span></div>
  </body></html>`;
  downloadBlob(`${rfq.id}.doc`, "application/msword", html);
}

// Excel-compatible .xls (HTML table) download
function downloadAsXls(rfq: any) {
  const table = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${rfq.id}</title></head><body>
  <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px">
    <tr><th colspan="2">REQUEST FOR QUOTATION (RFQ)</th></tr>
    <tr><td>RFQ #</td><td>${rfq.id}</td></tr>
    <tr><td>Project</td><td>${rfq.projectId} — ${rfq.projectName}</td></tr>
    <tr><td>Vendor</td><td>${rfq.toVendor}</td></tr>
    <tr><td>Attention</td><td>${rfq.attention||""}</td></tr>
    <tr><td>Email</td><td>${rfq.email||""}</td></tr>
    <tr><td>Phone</td><td>${rfq.phone||""}</td></tr>
    <tr><td>Due Date</td><td>${formatDate(rfq.dueDate)}</td></tr>
    <tr><td>Terms</td><td>${rfq.terms}</td></tr>
    <tr><td>Status</td><td>${rfq.status}</td></tr>
    <tr><th colspan="2">Title / Heading</th></tr>
    <tr><td colspan="2">${rfq.title || "(Untitled RFQ)"}</td></tr>
    <tr><th colspan="2">Scope of Work / Pricing Matrix</th></tr>
    <tr><td colspan="2">${(rfq.scope||"").replace(/\n/g,"<br/>")}</td></tr>
    <tr><th colspan="2">Notes / Clarifications</th></tr>
    <tr><td colspan="2">${(rfq.notes||"").replace(/\n/g,"<br/>")}</td></tr>
  </table></body></html>`;
  downloadBlob(`${rfq.id}.xls`, "application/vnd.ms-excel", table);
}

// Lightweight CSV/TSV parser that handles quotes
function parseSeparatedValues(text: string, delimiter: "\t" | ",") {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const rows: string[][] = [];
  for (const line of lines) {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && ch === delimiter) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    // trim surrounding quotes/space
    rows.push(out.map((s) => s.replace(/^\s*\"|\"\s*$/g, "").trim()));
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

// ==========================
// Demo Data (from your sample)
// ==========================
const purchaseOrders = [
  { id: "20715", date: "4/26/21", vendor: "NODE Architecture Engineering Con", project: "81084", division: "Venture", amount: 230233.86, paid: 190233.96, balance: 39999.9, status: "Open", vendorAddress: "File", vendorPhone: "File", deliverTo: "Site", items: [{ qty: 1, description: "Details", unitPrice: 230233.86, total: 230233.86 }], payments: [{ date: "Var", description: "History", amount: 190233.96, balance: 39999.9 }] },
  { id: "23185", date: "11/7/23", vendor: "AK International", project: "23900", division: "SCA", amount: 97580, paid: 96340, balance: 1240, status: "Open", vendorAddress: "File", vendorPhone: "File", deliverTo: "Site", items: [{ qty: 1, description: "Details", unitPrice: 97580, total: 97580 }], payments: [{ date: "Var", description: "History", amount: 96340, balance: 1240 }] },
  { id: "23668", date: "3/5/24", vendor: "Jin Chen Construction", project: "28600-24", division: "Venture", amount: 261236.08, paid: 245236.08, balance: 16000, status: "Open", vendorAddress: "File", vendorPhone: "File", deliverTo: "Site", items: [{ qty: 1, description: "Details", unitPrice: 261236.08, total: 261236.08 }], payments: [{ date: "Var", description: "History", amount: 245236.08, balance: 16000 }] },
  { id: "23741", date: "3/25/24", vendor: "Quality Plumbing Inc", project: "81084", division: "Venture", amount: 189500, paid: 75800, balance: 113700, status: "Open", vendorAddress: "File", vendorPhone: "File", deliverTo: "Site", items: [{ qty: 1, description: "Details", unitPrice: 189500, total: 189500 }], payments: [{ date: "Var", description: "History", amount: 75800, balance: 113700 }] },
  { id: "23799", date: "4/8/24", vendor: "Elite Painting Services", project: "28600-24", division: "Venture", amount: 87500, paid: 35000, balance: 52500, status: "Open", vendorAddress: "File", vendorPhone: "File", deliverTo: "Site", items: [{ qty: 1, description: "Details", unitPrice: 87500, total: 87500 }], payments: [{ date: "Var", description: "History", amount: 35000, balance: 52500 }] },
];

// Sample Change Orders dataset parsed from AP - CO LOG.xlsx (first few entries)
const changeOrders = [
  {
    id: "25189-01",
    status: "",
    project: "30300",
    date: "2025-04-11",
    amount: 1050,
    paid: 1050,
    balance: 0,
    vendor: "M-CAD Group (CAD-Cabinets)",
    division: "",
  },
  {
    id: "25190-01",
    status: "",
    project: "30300",
    date: "2025-04-11",
    amount: 650,
    paid: 650,
    balance: 0,
    vendor: "M-CAD Group (CAD-Cabinets)",
    division: "",
  },
  {
    id: "25237-01",
    status: "CLOSED",
    project: "30300",
    date: "2025-06-19",
    amount: 1500,
    paid: 1500,
    balance: 0,
    vendor: "M-CAD Group (CAD-Cabinets)",
    division: "",
  },
];

// Aggregate all payment entries across purchase orders
const allPayments = purchaseOrders.flatMap((po) =>
  po.payments.map((p) => ({
    poId: po.id,
    date: p.date,
    description: p.description,
    amount: p.amount,
    vendor: po.vendor,
    project: po.project,
  }))
);

const vendors = [
  { id: "V-001", name: "NODE Architecture Engineering Consulting P.C.", category: "Professional Services", contact: "John Smith", phone: "(212) 555-0100", outstanding: 39999.9, email: "contact@nodearch.com" },
  { id: "V-002", name: "Ratigan - Schottler Manufacturing", category: "Fabrication", contact: "Jane Doe", phone: "(718) 555-0200", outstanding: 274596.72, email: "info@rsmanufacturing.com" },
  { id: "V-003", name: "ASST", category: "General Contractor", contact: "Bob Johnson", phone: "(347) 555-0300", outstanding: 51416, email: "admin@asst.com" },
];

const projects = [
  {
    id: "23185",
    name: "Boyland Community Center",
    client: "DASNY",
    division: "SCA",
    budget: 97580,
    spent: 0,
    status: "Active",
  },
  {
    id: "23300",
    name: "Brooklyn Public Library",
    client: "Brooklyn Public Library",
    division: "Institutional",
    budget: 254000,
    spent: 0,
    status: "Active",
  },
  {
    id: "23400",
    name: "Hunts Point Distribution Center",
    client: "NYCEDC",
    division: "Civil",
    budget: 3950000,
    spent: 0,
    status: "Active",
  },
  {
    id: "26100-25",
    name: "Icahn Stadium Track",
    client: "NYC Parks",
    division: "Institutional",
    budget: 1850000,
    spent: 0,
    status: "Closed",
  },
  {
    id: "27600-24",
    name: "Kingsborough CC",
    client: "CUNY",
    division: "Institutional",
    budget: 1275000,
    spent: 0,
    status: "Active",
  },
  {
    id: "28600-24",
    name: "John Jay Pool Renovation",
    client: "NYC Parks",
    division: "Venture",
    budget: 1420000,
    spent: 0,
    status: "Active",
  },
  {
    id: "81084",
    name: "250 Ashland NYCHA",
    client: "NYCHA",
    division: "Venture",
    budget: 2100000,
    spent: 0,
    status: "Active",
  },
];

// === Project Master List Schema (locked to Excel columns & order) ===
const PROJECT_LIST_SCHEMA: string[] = [
  "Project # - Com. Year",
  "Project Number & Name",
  "Project Name",
  "GC",
  "PM",
  "Division",
  "Contract Award + C.O.s",
  "Original Contract Award",
  "Contract Balance",
  "Open or Closed",
  "Change Orders",
  "OWNER",
  "Contract #",
  "Contract Date",
  "Net Terms",
  "GC PM Contact",
  "Insurance Program",
];

// In-memory dataset (starts empty until user uploads/pastes)
const projectMasterRows: any[] = [];

// Current Project Numbers dataset (mock — can be wired to Excel)
const currentProjectNumbers = [
  {
    number: "23185",
    name: "Boyland Community Center",
    gc: "Skanska",
    pmTeam: "ZM/JL",
    year: 2023,
    status: "Active",
  },
  {
    number: "23300",
    name: "Brooklyn Public Library",
    gc: "Turner",
    pmTeam: "AP/KS",
    year: 2024,
    status: "Active",
  },
  {
    number: "23400",
    name: "Hunts Point Distribution Center",
    gc: "AECOM-Tishman",
    pmTeam: "PL/DR",
    year: 2024,
    status: "Active",
  },
  {
    number: "26100-25",
    name: "Icahn Stadium Track",
    gc: "Gilbane",
    pmTeam: "AL/GC",
    year: 2025,
    status: "Closed",
  },
  {
    number: "27600-24",
    name: "Kingsborough CC",
    gc: "Lendlease",
    pmTeam: "KM/JH",
    year: 2024,
    status: "Active",
  },
  {
    number: "28600-24",
    name: "John Jay Pool Renovation",
    gc: "Barr & Barr",
    pmTeam: "KL/TT",
    year: 2024,
    status: "Active",
  },
  {
    number: "81084",
    name: "250 Ashland NYCHA",
    gc: "STV",
    pmTeam: "ZM/PL",
    year: 2025,
    status: "Active",
  },
];

// RFQ data
const RFQ_STATUSES = ["Open", "Sent", "Received", "Awarded", "Closed"];

const seedRFQs = [
  { id: "RFQ-24001", title: "Millwork Package — Lobby & Admin", projectId: "28600-24", projectName: "John Jay Pool Renovation", toVendor: "Ratigan - Schottler Manufacturing", dueDate: "2025-10-31", created: "2025-10-23", status: "Open", amountRange: "$150k–$220k", attention:"", email:"", phone:"", terms:"Net 30", scope:"• Provide shop drawings\n• Provide samples\n• Lead time 8–10 weeks", notes:"Include alternates A1–A3" },
  { id: "RFQ-24002", title: "Painting Scope — Building A", projectId: "28600-24", projectName: "John Jay Pool Renovation", toVendor: "Elite Painting Services", dueDate: "2025-11-05", created: "2025-10-23", status: "Sent", amountRange: "$65k–$95k", attention:"", email:"", phone:"", terms:"Net 30", scope:"Per spec 09 90 00", notes:"Union required" },
  { id: "RFQ-24003", title: "Plumbing Trim & Fixtures", projectId: "81084", projectName: "250 Ashland NYCHA", toVendor: "Quality Plumbing Inc", dueDate: "2025-10-29", created: "2025-10-23", status: "Received", amountRange: "$120k–$180k", attention:"", email:"", phone:"", terms:"Net 30", scope:"Per MEP set", notes:"CTA addendum 2" },
];

// ==========================
// UI Primitives (Monochrome)
// ==========================
const BorderCard = ({ children, className = "" }: any) => (
  <div className={`rounded-2xl border-[1.5px] border-black bg-white ${className}`}>
    {children}
  </div>
);

const KPICard = ({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) => (
  <BorderCard className="p-4">
    <div className="text-xs uppercase tracking-widest text-black/60">{label}</div>
    <div className="mt-2 text-3xl font-semibold leading-tight">{value}</div>
    {meta && <div className="mt-2 text-xs text-black/60">{meta}</div>}
  </BorderCard>
);

const Pill = ({ text }: { text: string }) => {
  const s = String(text || "");
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  const byStatus: Record<string, string> = {
    Open: "border-black text-black",
    Sent: "border-black/70 text-black/80",
    Received: "border-black bg-black text-white",
    Awarded: "border-black text-black",
    Closed: "border-black/40 text-black/50",
  };
  return <span className={`${base} ${byStatus[s] || "border-black text-black"}`}>{s || "—"}</span>;
};

// ==========================
// NAV (Left rail with groups)
// ==========================
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  {
    id: "projects",
    label: "Projects",
    icon: Building,
    children: [
      { id: "current-project-numbers", label: "Current Project Numbers", icon: FileText },
      { id: "project-master-list", label: "Project Master List", icon: FileText },
    ],
  },
  {
    id: "rfqs",
    label: "RFQs",
    icon: FileText,
    children: [
      { id: "view-rfqs", label: "View RFQs", icon: Eye },
      { id: "create-rfq", label: "Create RFQ", icon: Plus },
    ],
  },
  {
    id: "pos",
    label: "Purchase Orders",
    icon: ShoppingCart,
    children: [
      { id: "view-pos", label: "View POs", icon: Eye },
      { id: "create-fab-po", label: "Fabrication PO", icon: Factory },
      { id: "create-installer-po", label: "Installer PO", icon: Wrench },
    ],
  },
  {
    id: "cos",
    label: "Change Orders",
    icon: FileEdit,
    children: [
      { id: "view-cos", label: "View COs", icon: Eye },
      { id: "create-co", label: "Create CO", icon: Plus },
    ],
  },
  {
    id: "view-payments",
    label: "Payments",
    icon: BadgeDollarSign,
  },
  { id: "monthly-bills", label: "Monthly Bills", icon: Calendar },
  { id: "vendors", label: "Vendors", icon: Users },
] as const;

const labelFor = (id: string) => {
  const top = NAV.find((n) => n.id === id);
  if (top) return top.label;
  for (const n of NAV) {
    const child = (n as any).children?.find((c: any) => c.id === id);
    if (child) return child.label;
  }
  return "Dashboard";
};

// ==========================
// Derived helpers
// ==========================
function groupByDivision(rows: typeof purchaseOrders) {
  const totals: Record<string, { total: number; count: number }> = {};
  let grand = 0;
  for (const r of rows) {
    totals[r.division] ??= { total: 0, count: 0 };
    totals[r.division].total += r.balance;
    totals[r.division].count += 1;
    grand += r.balance;
  }
  return Object.entries(totals).map(([division, { total, count }]) => ({
    division,
    total,
    count,
    pctWidth: grand ? Math.max(3, (total / grand) * 100) : 0,
  }));
}

// ==========================
// RFQ Preview Component
// ==========================
const RFQPreview = forwardRef<HTMLDivElement, { rfq: any }>(function RFQPreview({ rfq }, ref) {
  return (
    <div ref={ref} className="rounded-2xl border-[1.5px] border-black bg-white">
      <div className="border-b-[1.5px] border-black p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">REQUEST FOR QUOTATION (RFQ)</h3>
            <p className="text-[11px] text-black/60">ELLI NY DESIGN • 51-05 Flushing Ave, Maspeth, NY 11378 • 718-418-9002</p>
          </div>
          <div className="text-right">
            <div className="text-xs">RFQ #</div>
            <div className="text-lg font-semibold">{rfq.id}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border-b border-black">
        <div className="border-r border-black p-4">
          <div className="text-[11px] uppercase tracking-widest text-black/60">Project</div>
          <div className="mt-1 text-sm font-semibold">{rfq.projectId} — {rfq.projectName}</div>
        </div>
        <div className="p-4">
          <div className="text-[11px] uppercase tracking-widest text-black/60">To (Vendor)</div>
          <div className="mt-1 text-sm font-semibold">{rfq.toVendor || ""}</div>
          <div className="text-sm">Attn: {rfq.attention || ""}</div>
          <div className="text-sm">Email: {rfq.email || ""}</div>
          <div className="text-sm">Phone: {rfq.phone || ""}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-black">
        <div className="border-r border-black p-3">
          <div className="text-[11px] uppercase tracking-widest text-black/60">Due Date</div>
          <div className="text-sm font-semibold">{formatDate(rfq.dueDate) || ""}</div>
        </div>
        <div className="border-r border-black p-3">
          <div className="text-[11px] uppercase tracking-widest text-black/60">Terms</div>
          <div className="text-sm font-semibold">{rfq.terms || ""}</div>
        </div>
        <div className="p-3">
          <div className="text-[11px] uppercase tracking-widest text-black/60">Status</div>
          <div className="text-sm font-semibold">{rfq.status}</div>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-xl border border-black/30">
          <div className="border-b border-black/20 bg-black/5 p-2 text-[12px] font-semibold">Title / Heading</div>
          <div className="p-3 text-sm">{rfq.title || "(Untitled RFQ)"}</div>
        </div>
        <div className="mt-3 rounded-xl border border-black/30">
          <div className="border-b border-black/20 bg-black/5 p-2 text-[12px] font-semibold">Scope of Work / Pricing Matrix</div>
          <div className="whitespace-pre-wrap p-3 text-sm">{rfq.scope || "• Provide detailed pricing per drawings and specs.\n• List alternates and unit prices.\n• Include lead times and schedule impacts."}</div>
        </div>
        <div className="mt-3 rounded-xl border border-black/30">
          <div className="border-b border-black/20 bg-black/5 p-2 text-[12px] font-semibold">Notes / Clarifications</div>
          <div className="whitespace-pre-wrap p-3 text-sm">{rfq.notes || "All work to comply with contract documents, site safety rules, and applicable codes."}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black p-4 text-xs">
        <div>Prepared by: ELLI NY DESIGN — estimating@elli.example</div>
        <div>Date: {formatDate(new Date().toISOString().slice(0,10))}</div>
      </div>
    </div>
  );
});

// ==========================
// Main Component
// ==========================
export default function App() {
  const [active, setActive] = useState<string>("dashboard");
  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({
    rfqs: true,
    pos: true,
    cos: false,
  });
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof (typeof purchaseOrders)[number] | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [detailPO, setDetailPO] = useState<(typeof purchaseOrders)[number] | null>(null);

  // RFQ state
  const [rfqs, setRfqs] = useState(seedRFQs);
  const [viewRFQ, setViewRFQ] = useState<any>(null);

  // Derived data (POs)
  const filteredPOs = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = purchaseOrders.filter(
      (p) =>
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q)
    );
    if (sortKey) {
      rows = [...rows].sort((a: any, b: any) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "number" && typeof bv === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [query, sortKey, sortDir]);

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredPOs.length / perPage));
  const pageRows = filteredPOs.slice((page - 1) * perPage, page * perPage);
  useEffect(() => setPage(1), [query]);

  const kpis = useMemo(() => {
    const openPOs = purchaseOrders.length;
    const totalOutstanding = purchaseOrders.reduce((s, p) => s + p.balance, 0);
    const activeProjects = projects.filter((p) => p.status === "Active").length;
    return { openPOs, totalOutstanding, activeProjects, vendors: vendors.length };
  }, []);

  const setSort = (key: keyof (typeof purchaseOrders)[number]) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // ===================
  // Views
  // ===================
  const Dashboard = () => (
    <div className="space-y-6">
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <h3 className="text-xl font-semibold tracking-tight">ELLI ACCOUNTING — OVERVIEW</h3>
          <p className="mt-1 text-xs text-black/60">Real-time financial snapshot (demo data)</p>
        </div>
        <div className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <KPICard
              label="Total Outstanding"
              value={fmt.format(kpis.totalOutstanding)}
              meta={`Across ${purchaseOrders.length} open POs`}
            />
            <KPICard label="Open POs" value={`${kpis.openPOs}`} meta="Purchase Orders" />
            <KPICard label="Active Projects" value={`${kpis.activeProjects}`} meta="In progress" />
            <KPICard label="Vendors" value={`${kpis.vendors}`} meta="Active vendors" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <BorderCard className="p-4">
              <div className="border-b border-black/80 pb-2">
                <h4 className="text-sm font-semibold">Outstanding by Division</h4>
              </div>
              <div className="mt-3 space-y-3">
                {groupByDivision(purchaseOrders).map(({ division, count, total, pctWidth }) => (
                  <div key={division}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>
                        {division} ({count} POs)
                      </span>
                      <span className="font-semibold">{fmt.format(total)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-black/10">
                      <div className="h-3 rounded-full bg-black" style={{ width: `${pctWidth}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </BorderCard>

            <BorderCard className="p-4">
              <div className="border-b border-black/80 pb-2">
                <h4 className="text-sm font-semibold">Recent Activity</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {purchaseOrders.slice(0, 5).map((po) => (
                  <li
                    key={po.id}
                    className="flex items-center justify-between rounded-xl border border-black px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-4 w-4" />
                      <div>
                        <div className="font-medium">PO #{po.id}</div>
                        <div className="text-black/60">{po.vendor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmt.format(po.balance)}</div>
                      <Pill text="Open" />
                    </div>
                  </li>
                ))}
              </ul>
            </BorderCard>
          </div>

          <BorderCard className="mt-4 p-3 text-sm">
            <b>Note:</b> Demo shows 20 POs. Click any PO in the table view to open full details.
          </BorderCard>
        </div>
      </BorderCard>
    </div>
  );

  const VendorsView = () => (
    <BorderCard>
      <div className="border-b border-black/80 p-4">
        <h4 className="text-sm font-semibold">Vendor Directory</h4>
      </div>
      <div className="overflow-auto p-4">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-black text-white">
              {["Vendor ID", "Name", "Category", "Contact", "Phone", "Email", "Outstanding"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-widest">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-t border-black/20">
                <td className="px-3 py-2 font-medium">{v.id}</td>
                <td className="px-3 py-2">{v.name}</td>
                <td className="px-3 py-2">
                  <Pill text={v.category} />
                </td>
                <td className="px-3 py-2">{v.contact}</td>
                <td className="px-3 py-2">{v.phone}</td>
                <td className="px-3 py-2 text-black/70">{v.email}</td>
                <td className="px-3 py-2 text-right font-semibold">{fmt.format(v.outstanding)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BorderCard>
  );

  const POsView = () => (
    <BorderCard>
      <div className="border-b border-black/80 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h4 className="text-sm font-semibold">Purchase Orders</h4>
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-black/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search PO, Vendor, Project, Division"
                className="w-full rounded-full border border-black bg-white px-9 py-2 text-sm outline-none"
              />
            </div>
            <select
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-full border border-black bg-white px-3 py-2 text-sm"
            >
              <option value="">Sort by…</option>
              <option value="id">PO #</option>
              <option value="vendor">Vendor</option>
              <option value="project">Project</option>
              <option value="division">Division</option>
              <option value="amount">Amount</option>
              <option value="paid">Paid</option>
              <option value="balance">Balance</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="rounded-full border border-black px-3 py-2 text-sm"
            >
              {sortDir === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto p-4">
        <table className="w-full min-w-[820px] table-fixed border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">PO Number</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Date</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Vendor</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Project</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Division</th>
              <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Amount</th>
              <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Paid</th>
              <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Balance</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Status</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((po) => (
              <tr key={po.id} className="border-t border-black/20 hover:bg-black/5">
                <td className="px-3 py-2 font-medium">{po.id}</td>
                <td className="px-3 py-2">{po.date}</td>
                <td className="px-3 py-2">{po.vendor}</td>
                <td className="px-3 py-2">{po.project}</td>
                <td className="px-3 py-2">
                  <Pill text={po.division} />
                </td>
                <td className="w-24 text-right">{fmt.format(po.amount)}</td>
                <td className="w-24 text-right">{fmt.format(po.paid)}</td>
                <td className="w-24 text-right font-semibold">{fmt.format(po.balance)}</td>
                <td className="px-3 py-2">
                  <Pill text={po.status} />
                </td>
                <td className="px-3 py-2">
                  <button
                    className="rounded-full border border-black px-2 py-1 text-xs"
                    onClick={() => setDetailPO(po)}
                  >
                    <Eye className="mr-1 inline h-3 w-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-black/60">
            Page {page} of {totalPages} • {filteredPOs.length} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-black px-3 py-1 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-full border border-black px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PO Detail Overlay */}
      {detailPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-white bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/20 p-4">
              <div>
                <div className="text-lg font-semibold">Purchase Order #{detailPO.id}</div>
                <div className="text-xs text-black/60">Full details, line items, and payment history.</div>
              </div>
              <button onClick={() => setDetailPO(null)} className="rounded-full border border-black p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <BorderCard className="p-4">
                <div className="text-sm">
                  <div className="font-semibold">From</div>
                  <div className="mt-1 text-black/80">
                    <div>ELLI NY DESIGN</div>
                    <div>51-05 Flushing Avenue</div>
                    <div>Maspeth, New York 11378</div>
                    <div>Tel: 718-418-9002</div>
                    <div>Fax: 718-418-4629</div>
                  </div>
                </div>
              </BorderCard>
              <BorderCard className="p-4">
                <div className="text-sm">
                  <div className="font-semibold">To</div>
                  <div className="mt-1 text-black/80">
                    <div className="font-medium">{detailPO.vendor}</div>
                    <div>{detailPO.vendorAddress}</div>
                    <div>{detailPO.vendorPhone}</div>
                  </div>
                </div>
              </BorderCard>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-3">
              <BorderCard className="p-4">
                <div className="text-sm flex items-center justify-between">
                  <span className="text-black/60">PO Date:</span>
                  <span className="font-semibold">{detailPO.date}</span>
                </div>
              </BorderCard>
              <BorderCard className="p-4">
                <div className="text-sm flex items-center justify-between">
                  <span className="text-black/60">Project #:</span>
                  <span className="font-semibold">{detailPO.project}</span>
                </div>
              </BorderCard>
              <BorderCard className="p-4">
                <div className="text-sm flex items-center justify-between">
                  <span className="text-black/60">Division:</span>
                  <span className="font-semibold">{detailPO.division}</span>
                </div>
              </BorderCard>
              <BorderCard className="p-4 md:col-span-3">
                <div className="text-sm flex items-center justify-between">
                  <span className="text-black/60">Deliver To:</span>
                  <span className="font-semibold">{detailPO.deliverTo}</span>
                </div>
              </BorderCard>
            </div>

            <div className="p-4">
              <BorderCard className="overflow-auto p-4">
                <div className="border-b border-black/80 pb-2 text-sm font-semibold">Scope of Work</div>
                <table className="mt-3 w-full min-w-[560px] table-fixed border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      {["QTY", "Description", "Unit Price", "Line Total"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailPO.items.map((it: any, idx: number) => (
                      <tr key={idx} className="border-t border-black/20">
                        <td className="px-3 py-2">{it.qty}</td>
                        <td className="px-3 py-2">{it.description}</td>
                        <td className="px-3 py-2 text-right">{fmt.format(it.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmt.format(it.total)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-black/40">
                      <td className="px-3 py-2 text-right font-semibold" colSpan={3}>
                        TOTAL:
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt.format(detailPO.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </BorderCard>
            </div>

            <div className="grid gap-4 p-4 md:grid-cols-2">
              <BorderCard className="p-4 text-sm">
                <div className="font-semibold">Payment Summary</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-black/60">Total Amount:</span>
                    <span className="font-semibold">{fmt.format(detailPO.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Total Paid:</span>
                    <span className="font-semibold">{fmt.format(detailPO.paid)}</span>
                  </div>
                  <div className="border-t border-black/10" />
                  <div className="flex justify-between">
                    <span className="text-black/60">Balance Due:</span>
                    <span className="font-semibold">{fmt.format(detailPO.balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">% Paid:</span>
                    <span className="font-semibold">{pct((detailPO.paid / detailPO.amount) * 100)}</span>
                  </div>
                </div>
              </BorderCard>
              <BorderCard className="p-4 text-sm">
                <div className="font-semibold mb-2">Payment History</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black/20">
                      <th className="text-left py-1 text-black/60 font-normal">Date</th>
                      <th className="text-left py-1 text-black/60 font-normal">Description</th>
                      <th className="text-right py-1 text-black/60 font-normal">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPO.payments.map((p, idx) => (
                      <tr key={idx} className="border-b border-black/10">
                        <td className="py-1">{p.date}</td>
                        <td className="py-1">{p.description}</td>
                        <td className="text-right py-1">{fmt.format(p.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-black/20 font-semibold">
                      <td colSpan={2} className="py-1">Total Paid</td>
                      <td className="text-right py-1">{fmt.format(detailPO.paid)}</td>
                    </tr>
                  </tbody>
                </table>
              </BorderCard>
            </div>

            <div className="flex items-center gap-2 p-4">
              <button className="rounded-full border border-black px-3 py-2 text-sm">
                <BadgeDollarSign className="mr-2 inline h-4 w-4" /> Make Payment
              </button>
              <button className="rounded-full border border-black px-3 py-2 text-sm">
                <Printer className="mr-2 inline h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </BorderCard>
  );

  // View to display a list of Change Orders
  const ChangeOrdersView: React.FC = () => {
    return (
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <h4 className="text-sm font-semibold">Change Orders</h4>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-black text-white">
                <th className="w-24 px-2 py-1 text-left text-xs uppercase tracking-widest">CO #</th>
                <th className="w-24 px-2 py-1 text-left text-xs uppercase tracking-widest">Date</th>
                <th className="w-32 px-2 py-1 text-left text-xs uppercase tracking-widest">Vendor</th>
                <th className="w-40 px-2 py-1 text-left text-xs uppercase tracking-widest">Project</th>
                <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Amount</th>
                <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Paid</th>
                <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Balance</th>
                <th className="w-20 px-2 py-1 text-left text-xs uppercase tracking-widest">Status</th>
                <th className="w-20 px-2 py-1 text-left text-xs uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co) => (
                <tr key={co.id} className="border-t border-black/20 hover:bg-black/5">
                  <td className="px-2 py-2">{co.id}</td>
                  <td className="px-2 py-2">{co.date}</td>
                  <td className="px-2 py-2">{co.vendor}</td>
                  <td className="px-2 py-2">{co.project}</td>
                  <td className="px-2 py-2 text-right">${co.amount.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right">${co.paid.toLocaleString()}</td>
                  <td className="px-2 py-2 text-right">${co.balance.toLocaleString()}</td>
                  <td className="px-2 py-2">{co.status || "Open"}</td>
                  <td className="px-2 py-2">
                    <button className="text-blue-600 hover:underline cursor-pointer text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BorderCard>
    );
  };

  // View to display all payments across purchase orders
  const PaymentsView: React.FC = () => {
    return (
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <h4 className="text-sm font-semibold">Payments</h4>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-black text-white">
                <th className="w-24 px-2 py-1 text-left text-xs uppercase tracking-widest">PO #</th>
                <th className="w-24 px-2 py-1 text-left text-xs uppercase tracking-widest">Date</th>
                <th className="w-40 px-2 py-1 text-left text-xs uppercase tracking-widest">Description</th>
                <th className="w-24 px-2 py-1 text-right text-xs uppercase tracking-widest">Amount</th>
                <th className="w-32 px-2 py-1 text-left text-xs uppercase tracking-widest">Vendor</th>
                <th className="w-32 px-2 py-1 text-left text-xs uppercase tracking-widest">Project</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((p, idx) => (
                <tr key={idx} className="border-t border-black/20 hover:bg-black/5">
                  <td className="px-2 py-2">{p.poId}</td>
                  <td className="px-2 py-2">{p.date}</td>
                  <td className="px-2 py-2">{p.description}</td>
                  <td className="px-2 py-2 text-right">${p.amount.toLocaleString()}</td>
                  <td className="px-2 py-2">{p.vendor}</td>
                  <td className="px-2 py-2">{p.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BorderCard>
    );
  };

  // ===== Upload Drawer (Paste or File) =====
  function UploadDrawer({ open, onClose, onImport, title }: { open: boolean; onClose: () => void; onImport: (rows: any[]) => void; title: string; }) {
    const [mode, setMode] = useState<"paste" | "file">("paste");
    const [raw, setRaw] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    function parseDelimited(text: string) {
      const lines = text.replace(/\r\n?/g, "\n");
      const hasTabs = lines.includes("\t");
      const table = hasTabs
        ? parseSeparatedValues(lines, "\t")
        : parseSeparatedValues(lines, ",");
      if (!table.length) return [];

      // Detect header
      const header = table[0];
      const headerMatches = PROJECT_LIST_SCHEMA.every(
        (h, i) => (header[i] || "").toLowerCase() === h.toLowerCase()
      );
      const rowsOnly = headerMatches ? table.slice(1) : table;

      const errs: string[] = [];
      const good: any[] = [];
      rowsOnly.forEach((cols, idx) => {
        if (cols.length !== PROJECT_LIST_SCHEMA.length) {
          errs.push(
            `Row ${idx + 1}: expected ${PROJECT_LIST_SCHEMA.length} columns, got ${cols.length}`
          );
          return;
        }
        const obj: any = {};
        PROJECT_LIST_SCHEMA.forEach((key, i) => {
          obj[key] = cols[i] ?? "";
        });
        good.push(obj);
      });
      setErrors(errs);
      return good;
    }

    function handleImport() {
      const rows = parseDelimited(raw);
      if (rows.length && errors.length === 0) onImport(rows);
    }

    // Minimal file path: accept CSV/TSV immediate; .xlsx/.pdf/.docx stored only in preview
    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      const name = file.name.toLowerCase();
      try {
        if (name.endsWith('.csv') || name.endsWith('.tsv')) {
          const text = await file.text();
          setMode('paste');
          setRaw(text);
        } else if (name.endsWith('.xlsx')) {
          // .xlsx parsing is not available in this preview
          setErrors([
            ".xlsx import not supported in this preview. Please convert your sheet to CSV/TSV or paste the rows directly.",
          ]);
          return;
        } else if (name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx')) {
          setErrors(['Attachment stored only in preview. Use CSV/TSV/Paste for table import.']);
        } else {
          setErrors(['Unsupported file type. Use .xlsx/.csv/.tsv or paste directly.']);
        }
      } catch (err: any) {
        setErrors([String(err?.message || err)]);
      } finally {
        e.currentTarget.value = '';
      }
    }

    function downloadTemplate() {
      const csv = PROJECT_LIST_SCHEMA.join(",") + "\n";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "PROJECT_LIST_TEMPLATE.csv";
      a.click();
      URL.revokeObjectURL(url);
    }

    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-black/50 md:items-center md:justify-center">
        <div className="w-full rounded-t-2xl border border-black bg-white md:max-w-3xl md:rounded-2xl">
          <div className="flex items-center justify-between border-b border-black/20 p-4">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-xs text-black/60">
                Schema locked to Excel columns • Paste recommended; .xlsx uses dynamic parser if available
              </div>
            </div>
            <button onClick={onClose} className="rounded-full border border-black p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setMode("paste")}
                className={`rounded-full border px-3 py-1 text-sm ${
                  mode === "paste" ? "bg-black text-white" : "border-black"
                }`}
              >
                Paste
              </button>
              <button
                onClick={() => setMode("file")}
                className={`rounded-full border px-3 py-1 text-sm ${
                  mode === "file" ? "bg-black text-white" : "border-black"
                }`}
              >
                File
              </button>
              <button
                onClick={downloadTemplate}
                className="ml-auto rounded-full border border-black px-3 py-1 text-sm"
              >
                Download Template
              </button>
            </div>

            {mode === "paste" && (
              <div>
                <div className="mb-2 text-xs text-black/60">
                  Copy rows directly from Excel (including header, optional) and paste below. We validate column count (
                  {PROJECT_LIST_SCHEMA.length}).
                </div>
                <textarea
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder={PROJECT_LIST_SCHEMA.join("\t")}
                  className="h-48 w-full rounded-xl border border-black/50 p-3 text-sm"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleImport}
                    className="rounded-full border border-black px-4 py-2 text-sm"
                  >
                    Validate & Import
                  </button>
                  <span className="text-xs text-black/60">Errors: {errors.length}</span>
                </div>
                {errors.length > 0 && (
                  <ul className="mt-2 max-h-32 overflow-auto rounded-xl border border-black/20 bg-black/5 p-2 text-xs">
                    {errors.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {mode === "file" && (
              <div className="space-y-2">
                <div className="text-xs text-black/60">
                  Upload .xlsx (will be parsed in the full app), or .csv/.tsv for immediate import. PDFs/Word are stored as attachments only.
                </div>
                <input
                  type="file"
                  accept=".xlsx,.csv,.tsv,.pdf,.doc,.docx"
                  onChange={handleFile}
                  className="rounded-xl border border-black p-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const CurrentProjectNumbersView = () => {
    const [search, setSearch] = useState("");
    const [year, setYear] = useState<string | number>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const years = Array.from(new Set(currentProjectNumbers.map((p) => p.year))).sort();

    const rows = useMemo(() => {
      return currentProjectNumbers.filter((r) => {
        const q = search.toLowerCase();
        const matchesQ =
          !q || `${r.number} ${r.name} ${r.gc} ${r.pmTeam}`.toLowerCase().includes(q);
        const matchesYear = year === "All" || r.year === year;
        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        return matchesQ && matchesYear && matchesStatus;
      });
    }, [search, year, statusFilter]);

    return (
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h4 className="text-sm font-semibold">Current Project Numbers</h4>
            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-black/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, number, GC, PM team"
                  className="w-full rounded-full border border-black bg-white px-9 py-2 text-sm outline-none"
                />
              </div>
              <select
                value={year as any}
                onChange={(e) => setYear(e.target.value === "All" ? "All" : Number(e.target.value))}
                className="rounded-full border border-black bg-white px-3 py-2 text-sm"
              >
                <option value="All">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-black bg-white px-3 py-2 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full min-w-[820px] table-fixed border-collapse">
            <thead>
              <tr className="bg-black text-white">
                {["Project Number", "Project Name", "GC Name", "PM Team", "Year", "Status"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-widest">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.number} className="border-t border-black/20 hover:bg-black/5">
                  <td className="px-3 py-2 font-medium">{r.number}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.gc}</td>
                  <td className="px-3 py-2">{r.pmTeam}</td>
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">
                    {r.status === "Closed" ? (
                      <span className="rounded-full border border-black px-2 py-0.5 text-xs">
                        Closed Out
                      </span>
                    ) : (
                      <Pill text="Active" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pt-3 text-xs text-black/60">
            {rows.length} of {currentProjectNumbers.length} shown
          </div>
        </div>
      </BorderCard>
    );
  };

  // Minimal Project Master List view (kept from earlier design)
  const ProjectMasterListView = () => {
    const [openUpload, setOpenUpload] = useState(false);
    const [rows, setRows] = useState<any[]>(projectMasterRows);

    function importRows(newRows: any[]) {
      setRows((prev) => [...prev, ...newRows]); // append-only
      setOpenUpload(false);
    }

    return (
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Project Master List</h4>
            <button onClick={() => setOpenUpload(true)} className="rounded-full border border-black px-3 py-2 text-sm">Upload</button>
          </div>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full min-w-[1200px] table-fixed border-collapse">
            <thead>
              <tr className="bg-black text-white">
                {PROJECT_LIST_SCHEMA.map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={PROJECT_LIST_SCHEMA.length} className="px-3 py-8 text-center text-sm text-black/60">
                    No data yet. Click <b>Upload</b> to paste rows exactly as in Excel (columns locked 1:1).
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx} className="border-t border-black/20 hover:bg-black/5">
                    {PROJECT_LIST_SCHEMA.map((h) => (
                      <td key={h} className="px-3 py-2">{String(r[h] ?? "")}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <UploadDrawer open={openUpload} onClose={() => setOpenUpload(false)} onImport={importRows} title="Upload — Project Master List" />
      </BorderCard>
    );
  };

  // RFQ List View
  const RFQListView = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    const filtered = useMemo(() => {
      const q = search.toLowerCase();
      return rfqs.filter((r) => {
        const matchesQ = !q || `${r.id} ${r.title} ${r.projectId} ${r.projectName} ${r.toVendor}`.toLowerCase().includes(q);
        const matchesStatus = status === "All" || r.status === status;
        return matchesQ && matchesStatus;
      });
    }, [search, status]);

    return (
      <BorderCard>
        <div className="border-b border-black/80 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h4 className="text-sm font-semibold">RFQ Log</h4>
            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-black/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search RFQ #, title, project, vendor"
                  className="w-full rounded-full border border-black bg-white px-9 py-2 text-sm outline-none"
                />
              </div>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-full border border-black bg-white px-3 py-2 text-sm">
                <option value="All">All Status</option>
                {RFQ_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-auto p-4">
          <table className="w-full min-w-[980px] table-fixed border-collapse">
            <thead>
              <tr className="bg-black text-white">
                {["RFQ #","Title / Heading","Project","Vendor","Due Date","Created","Status","Amount","Details"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-black/20 hover:bg-black/5">
                  <td className="px-3 py-2 font-medium">{r.id}</td>
                  <td className="px-3 py-2">{r.title}</td>
                  <td className="px-3 py-2">{r.projectId} — {r.projectName}</td>
                  <td className="px-3 py-2">{r.toVendor}</td>
                  <td className="px-3 py-2">{formatDate(r.dueDate)}</td>
                  <td className="px-3 py-2">{formatDate(r.created)}</td>
                  <td className="px-3 py-2"><Pill text={r.status} /></td>
                  <td className="px-3 py-2">{r.amountRange ?? "—"}</td>
                  <td className="px-3 py-2">
                    <button className="rounded-full border border-black px-2 py-1 text-xs" onClick={() => setViewRFQ(r)}>
                      <Eye className="mr-1 inline h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pt-3 text-xs text-black/60">{filtered.length} of {rfqs.length} shown</div>
        </div>
      </BorderCard>
    );
  };

  // RFQ Create View
  const RFQCreateView = () => {
    const [form, setForm] = useState({
      id: "RFQ-" + Math.floor(10000 + Math.random() * 89999),
      title: "",
      projectId: "28600-24",
      projectName: "John Jay Pool Renovation",
      toVendor: "",
      attention: "",
      email: "",
      phone: "",
      dueDate: "",
      terms: "Net 30",
      scope: "",
      notes: "",
      status: "Open",
    });
    const [previewMode, setPreviewMode] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const printRef = useRef<HTMLDivElement>(null);

    const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const cell = (label: string, value: string, onChange: (v: string) => void, placeholder = "", props = {}) => (
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1 text-[11px] uppercase tracking-widest text-black/60">{label}</div>
        <div className="col-span-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} {...props} className="w-full rounded-none border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
        </div>
      </div>
    );

    const validate = () => {
      const e: Record<string, string> = {};
      if (!form.title.trim()) e.title = "Title is required";
      if (!form.toVendor.trim()) e.toVendor = "Vendor is required";
      if (!form.dueDate) e.dueDate = "Due date is required";
      if (!form.scope.trim()) e.scope = "Scope is required";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const saveDraft = () => {
      if (!validate()) return;
      const newRFQ = { ...form, created: new Date().toISOString().slice(0, 10), amountRange: "—" };
      setRfqs((prev) => {
        const idx = prev.findIndex((r) => r.id === newRFQ.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newRFQ;
          return copy;
        }
        return [newRFQ, ...prev];
      });
      setActive("view-rfqs");
    };

    const printPDF = () => {
      window.print();
    };

    return (
      <div className="space-y-4">
        <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; inset: 0; margin: 0; } }`}</style>
        <div className="flex items-center justify-between">
          <div className="text-sm text-black/60">Fill the form cells, toggle Preview, then Print → Save as PDF (exact layout) or download as Word/Excel.</div>
          <div className="flex gap-2">
            <button onClick={() => setPreviewMode((p) => !p)} className="rounded-full border border-black px-3 py-2 text-sm">{previewMode ? "Edit Mode" : "Preview Mode"}</button>
            <button onClick={saveDraft} className="rounded-full border border-black px-3 py-2 text-sm">Save Draft</button>
            <button onClick={() => downloadAsDoc(form)} className="rounded-full border border-black px-3 py-2 text-sm">Word (.doc)</button>
            <button onClick={() => downloadAsXls(form)} className="rounded-full border border-black px-3 py-2 text-sm">Excel (.xls)</button>
            <button onClick={printPDF} className="rounded-full border border-black px-3 py-2 text-sm"><Printer className="mr-2 inline h-4 w-4"/>Print / PDF</button>
          </div>
        </div>

        {!previewMode && (
          <BorderCard className="p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {cell("RFQ #", form.id, (v) => update("id", v))}
              {cell("Project #", form.projectId, (v) => update("projectId", v))}
              {cell("Project Name", form.projectName, (v) => update("projectName", v))}
              {cell("Title / Heading", form.title, (v) => update("title", v), "Brief scope title")}
              {cell("To (Vendor)", form.toVendor, (v) => update("toVendor", v))}
              {cell("Attention", form.attention, (v) => update("attention", v))}
              {cell("Email", form.email, (v) => update("email", v))}
              {cell("Phone", form.phone, (v) => update("phone", v))}
              {cell("Due Date", form.dueDate, (v) => update("dueDate", v), "YYYY-MM-DD", { type: "date" })}
              {cell("Terms", form.terms, (v) => update("terms", v))}
              <div className="md:col-span-2">
                <div className="text-[11px] uppercase tracking-widest text-black/60">Scope of Work</div>
                <textarea value={form.scope} onChange={(e) => update("scope", e.target.value)} rows={6} className={`w-full rounded-xl border p-3 text-sm ${errors.scope ? "border-red-500" : "border-black/40"}`} placeholder="Bullet points of the requested scope, specs, drawings refs, alternates, unit prices, etc." />
                {errors.scope && <div className="mt-1 text-xs text-red-600">{errors.scope}</div>}
              </div>
              <div className="md:col-span-2">
                <div className="text-[11px] uppercase tracking-widest text-black/60">Notes</div>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={4} className="w-full rounded-xl border border-black/40 p-3 text-sm" placeholder="Clarifications, site walk info, schedule, submittal requirements, inclusions/exclusions." />
              </div>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {errors.title && <div className="text-xs text-red-600">{errors.title}</div>}
              {errors.toVendor && <div className="text-xs text-red-600">{errors.toVendor}</div>}
              {errors.dueDate && <div className="text-xs text-red-600">{errors.dueDate}</div>}
              {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
            </div>
          </BorderCard>
        )}

        {/* Printable RFQ Layout */}
        <div id="print-area" ref={printRef}>
          <RFQPreview rfq={form} />
        </div>
      </div>
    );
  };

  // RFQ Modal
  const RFQModal = ({ rfq, onClose }: { rfq: any; onClose: () => void }) => {
    const printRef = useRef<HTMLDivElement>(null);
    if (!rfq) return null;
    const handlePrint = () => window.print();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <style>{`@media print { body * { visibility: hidden; } #rfq-modal-print, #rfq-modal-print * { visibility: visible; } #rfq-modal-print { position: absolute; inset: 0; margin: 0; } }`}</style>
        <div className="w-full max-w-4xl rounded-2xl border border-white bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/20 p-4">
            <div>
              <div className="text-lg font-semibold">{rfq.id} — {rfq.title || "(Untitled RFQ)"}</div>
              <div className="text-xs text-black/60">{rfq.projectId} — {rfq.projectName}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadAsDoc(rfq)} className="rounded-full border border-black px-3 py-1 text-xs">Word (.doc)</button>
              <button onClick={() => downloadAsXls(rfq)} className="rounded-full border border-black px-3 py-1 text-xs">Excel (.xls)</button>
              <button onClick={handlePrint} className="rounded-full border border-black px-3 py-1 text-xs"><Printer className="mr-1 inline h-3 w-3"/>PDF</button>
              <button onClick={onClose} className="rounded-full border border-black p-1"><X className="h-4 w-4"/></button>
            </div>
          </div>
          <div id="rfq-modal-print" ref={printRef} className="p-4">
            <RFQPreview rfq={rfq} />
          </div>
        </div>
      </div>
    );
  };

  // ===== App Return (restored) =====
  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r-[1.5px] border-black bg-white">
        <div className="border-b-[1.5px] border-black p-5">
          <h1 className="text-xl font-bold tracking-tight">ELLI V1</h1>
          <p className="text-[11px] text-black/60">AP/AR Dashboard · Monochrome</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((group) => (
            <div key={group.id} className="mb-1">
              {(group as any).children ? (
                <div>
                  <button
                    onClick={() =>
                      setOpenGroup((g) => ({ ...g, [group.id]: !g[group.id as keyof typeof g] }))
                    }
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-black/5"
                  >
                    <div className="flex items-center">
                      <group.icon className="mr-3 h-5 w-5" />
                      <span className="text-sm font-medium">{group.label}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${openGroup[group.id] ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openGroup[group.id] && (
                    <div className="ml-8 mt-1 space-y-1">
                      {(group as any).children.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => setActive(item.id)}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5 ${
                            active === item.id ? "bg-black text-white" : ""
                          }`}
                        >
                          <item.icon
                            className={`mr-2 h-4 w-4 ${active === item.id ? "text-white" : ""}`}
                          />
                          <span className={`${active === item.id ? "text-white" : ""}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setActive(group.id)}
                  className={`flex w-full items-center rounded-xl px-3 py-2 text-left hover:bg-black/5 ${
                    active === group.id ? "bg-black text-white" : ""
                  }`}
                >
                  <group.icon className={`mr-3 h-5 w-5 ${active === group.id ? "text-white" : ""}`} />
                  <span className="text-sm font-medium">{group.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <section className="flex-1">
        <header className="sticky top-0 z-10 border-b-[1.5px] border-black bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">{labelFor(active)}</h2>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-black/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-72 rounded-full border border-black bg-white px-9 py-2 text-sm outline-none"
              />
            </div>
          </div>
        </header>
        <main className="max-h-[calc(100vh-68px)] overflow-y-auto p-6">
          {active === "dashboard" && <Dashboard />}
          {active === "view-pos" && <POsView />}
          {active === "vendors" && <VendorsView />}
          {active === "current-project-numbers" && <CurrentProjectNumbersView />}
          {active === "project-master-list" && <ProjectMasterListView />}
          {active === "view-rfqs" && <RFQListView />}
          {active === "create-rfq" && <RFQCreateView />}
          {active === "create-fab-po" && (
            <FabricatorPOCreateView projects={projects} vendors={vendors} />
          )}
          {active === "create-installer-po" && (
            <InstallerPOCreateView projects={projects} vendors={vendors} />
          )}
          {active === "create-co" && (
            <ChangeOrderCreateView projects={projects} vendors={vendors} purchaseOrders={purchaseOrders} />
          )}
          {active === "view-cos" && <ChangeOrdersView />}
          {active === "view-payments" && <PaymentsView />}
        </main>
      </section>

      {/* RFQ Modal */}
      <RFQModal rfq={viewRFQ} onClose={() => setViewRFQ(null)} />
    </div>
  );
}
