import React from "react";
import { Eye } from "lucide-react";

// A simple card with border and header
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl border-[1.5px] border-black mb-4">
    <div className="border-b-[1.5px] border-black p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export interface Receivable {
  id: string;
  project: string;
  requisition: string;
  month: string;
  status: string;
  net: number;
  submitted: string;
  approved?: string;
  paid?: string;
}

export const ReceivablesSummaryView: React.FC<{ receivables: Receivable[] }> = ({
  receivables,
}) => {
  const totals: Record<string, number> = {};
  receivables.forEach((r) => {
    totals[r.status] = (totals[r.status] || 0) + r.net;
  });
  return (
    <Card title="Receivables Summary">
      <table className="w-full table-fixed text-sm border-collapse">
        <thead className="border-b border-black/20">
          <tr>
            <th className="px-2 py-1 text-left w-1/2">Status</th>
            <th className="px-2 py-1 text-right w-1/2">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(totals).map((status) => (
            <tr key={status} className="border-b border-black/10 hover:bg-black/5">
              <td className="px-2 py-1 capitalize">{status}</td>
              <td className="px-2 py-1 text-right">
                {totals[status].toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export const ReceivablesLogView: React.FC<{
  receivables: Receivable[];
  onViewProject?: (projectId: string) => void;
}> = ({
  receivables,
  onViewProject,
}) => (
  <Card title="Requisitions Log">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-24 px-2 py-1">Project #</th>
          <th className="w-24 px-2 py-1">Requisition</th>
          <th className="w-20 px-2 py-1">Month</th>
          <th className="w-32 px-2 py-1">Status</th>
          <th className="w-24 px-2 py-1 text-right">Net Amount</th>
          <th className="w-32 px-2 py-1">Submitted</th>
          <th className="w-32 px-2 py-1">Approved</th>
          <th className="w-32 px-2 py-1">Paid</th>
          <th className="w-20 px-2 py-1">Details</th>
        </tr>
      </thead>
      <tbody>
        {receivables.map((r) => (
          <tr
            key={r.id}
            className="border-b border-black/10 hover:bg-black/5 whitespace-nowrap"
          >
            <td className="px-2 py-1">{r.project}</td>
            <td className="px-2 py-1">{r.requisition}</td>
            <td className="px-2 py-1">{r.month}</td>
            <td className="px-2 py-1 capitalize">{r.status}</td>
            <td className="px-2 py-1 text-right">
              {r.net.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </td>
            <td className="px-2 py-1">{r.submitted}</td>
            <td className="px-2 py-1">{r.approved || "-"}</td>
            <td className="px-2 py-1">{r.paid || "-"}</td>
            <td className="px-2 py-1">
              {onViewProject && (
                <button
                  onClick={() => onViewProject(r.project)}
                  className="rounded-full border border-black px-2 py-1 text-xs hover:bg-black/5"
                >
                  <Eye className="inline h-3 w-3 mr-1" />
                  View
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

// Liens table
export interface Lien {
  id: string;
  project: string;
  gc: string;
  base: number;
  approvedCOs: number;
  paidToDate: number;
  pendingCOs: number;
  balance: number;
  lienDate: string;
  lienStatus: string;
}

export const LiensView: React.FC<{ liens: Lien[] }> = ({ liens }) => (
  <Card title="Project Liens & Disputes">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-24 px-2 py-1">Project</th>
          <th className="w-40 px-2 py-1">GC</th>
          <th className="w-24 px-2 py-1 text-right">Base</th>
          <th className="w-24 px-2 py-1 text-right">Approved COs</th>
          <th className="w-24 px-2 py-1 text-right">Paid</th>
          <th className="w-24 px-2 py-1 text-right">Pending COs</th>
          <th className="w-24 px-2 py-1 text-right">Balance</th>
          <th className="w-20 px-2 py-1">Lien Date</th>
          <th className="w-24 px-2 py-1">Status</th>
        </tr>
      </thead>
      <tbody>
        {liens.map((l) => (
          <tr key={l.id} className="border-b border-black/10 hover:bg-black/5">
            <td className="px-2 py-1">{l.project}</td>
            <td className="px-2 py-1">{l.gc}</td>
            <td className="px-2 py-1 text-right">
              {l.base.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1 text-right">
              {l.approvedCOs.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1 text-right">
              {l.paidToDate.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1 text-right">
              {l.pendingCOs.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1 text-right">
              {l.balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1">{l.lienDate}</td>
            <td className="px-2 py-1">{l.lienStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export interface ClosedProject {
  id: string;
  project: string;
  gc: string;
  finalAmount: number;
  completionDate: string;
}

export const ClosedProjectsView: React.FC<{ projects: ClosedProject[] }> = ({
  projects,
}) => (
  <Card title="Closed Projects">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-24 px-2 py-1">Project</th>
          <th className="w-40 px-2 py-1">GC</th>
          <th className="w-24 px-2 py-1 text-right">Final Amount</th>
          <th className="w-32 px-2 py-1">Completed</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr key={p.id} className="border-b border-black/10 hover:bg-black/5">
            <td className="px-2 py-1">{p.project}</td>
            <td className="px-2 py-1">{p.gc}</td>
            <td className="px-2 py-1 text-right">
              {p.finalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1">{p.completionDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);
