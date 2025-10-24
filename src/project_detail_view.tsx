import React from "react";
import { ArrowLeft, Upload } from "lucide-react";

// Project Detail View Component
// Matches the AR - Blank Project Template design spec

interface ProjectInfo {
  projectName: string;
  gcName: string;
  ownerName: string;
  contractNumber: string;
  projectManager: string;
}

interface ContractSummary {
  initialContractValue: number;
  approvedCOs: number;
  paymentToDate: number;
  paymentTerms: string;
  currentRetainagePercent: number;
}

interface Requisition {
  reqNumber: string;
  reqMonthYear: string;
  type: "Payment" | "Lien Notice";
  date: string;
  checkNumber: string;
  amount: number;
  balance: number;
}

interface ChangeOrder {
  elliCONumber: string;
  vendorTicket: string;
  elliAmount: number;
  dateSubmitted: string;
  regarding: string;
  approvedAmount: number;
  dateApproved: string;
  gcCONumber: string;
  addedToReq: string;
  billedToGCReq: string;
  paidDate: string;
  notes: string;
}

interface ProjectDetailData {
  projectInfo: ProjectInfo;
  contractSummary: ContractSummary;
  requisitions: Requisition[];
  changeOrders: ChangeOrder[];
}

const ProjectDetailView: React.FC<{
  project: ProjectDetailData;
  onBack: () => void;
}> = ({ project, onBack }) => {
  const { projectInfo, contractSummary, requisitions, changeOrders } = project;

  // Calculate derived values
  const contractWithApprovedCOs =
    contractSummary.initialContractValue + contractSummary.approvedCOs;
  const contractBalance = contractWithApprovedCOs - contractSummary.paymentToDate;
  const currentRetainageAmount =
    contractWithApprovedCOs * (contractSummary.currentRetainagePercent / 100);
  const totalPaymentToDate = requisitions.reduce((sum, req) => sum + req.amount, 0);
  const remainingBalance = contractWithApprovedCOs - totalPaymentToDate;

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="space-y-4">
      {/* Header with Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm hover:bg-black/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Log
        </button>
        <button className="flex items-center gap-2 rounded-full border border-black px-4 py-2 text-sm hover:bg-black/5">
          <Upload className="h-4 w-4" />
          Upload Excel
        </button>
      </div>

      {/* Top Summary Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Project Information (red header) */}
        <div className="rounded-2xl border-[1.5px] border-black">
          <div className="border-b-[1.5px] border-black bg-red-100 p-4">
            <h4 className="text-sm font-semibold">Project Information</h4>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Project Name:</span>
              <span className="font-medium">{projectInfo.projectName}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">General Contractor:</span>
              <span className="font-medium">{projectInfo.gcName}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Owner:</span>
              <span className="font-medium">{projectInfo.ownerName}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Contract Number:</span>
              <span className="font-medium">{projectInfo.contractNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Project Manager:</span>
              <span className="font-medium">{projectInfo.projectManager}</span>
            </div>
          </div>
        </div>

        {/* Contract Summary (yellow header) */}
        <div className="rounded-2xl border-[1.5px] border-black">
          <div className="border-b-[1.5px] border-black bg-yellow-100 p-4">
            <h4 className="text-sm font-semibold">Contract Summary</h4>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Initial Contract Value:</span>
              <span className="font-medium">{fmt.format(contractSummary.initialContractValue)}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Approved COs:</span>
              <span className="font-medium">
                {contractSummary.approvedCOs < 0 ? `(${fmt.format(Math.abs(contractSummary.approvedCOs))})` : fmt.format(contractSummary.approvedCOs)}
              </span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Contract with Approved COs:</span>
              <span className="font-semibold">{fmt.format(contractWithApprovedCOs)}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Payment to Date:</span>
              <span className="font-medium">{fmt.format(contractSummary.paymentToDate)}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Contract Balance:</span>
              <span className="font-semibold">{fmt.format(contractBalance)}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-2">
              <span className="text-black/60">Payment Terms:</span>
              <span className="font-medium">{contractSummary.paymentTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">Current Retainage:</span>
              <span className="font-medium">
                {contractSummary.currentRetainagePercent}% ({fmt.format(currentRetainageAmount)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Requisition Table */}
      <div className="rounded-2xl border-[1.5px] border-black">
        <div className="border-b-[1.5px] border-black p-4">
          <h4 className="text-sm font-semibold">Requisition History</h4>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full table-fixed text-sm border-collapse">
            <thead className="border-b border-black/20">
              <tr>
                <th className="w-24 px-2 py-1 text-left">Req #</th>
                <th className="w-32 px-2 py-1 text-left">Req Month Year</th>
                <th className="w-32 px-2 py-1 text-left">Type</th>
                <th className="w-28 px-2 py-1 text-left">Date</th>
                <th className="w-28 px-2 py-1 text-left">Check #</th>
                <th className="w-32 px-2 py-1 text-right">Amount</th>
                <th className="w-32 px-2 py-1 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((req, idx) => (
                <tr key={idx} className="border-b border-black/10 hover:bg-black/5">
                  <td className="px-2 py-1">{req.reqNumber}</td>
                  <td className="px-2 py-1">{req.reqMonthYear}</td>
                  <td className="px-2 py-1">{req.type}</td>
                  <td className="px-2 py-1">{req.date}</td>
                  <td className="px-2 py-1">{req.checkNumber}</td>
                  <td className="px-2 py-1 text-right">{fmt.format(req.amount)}</td>
                  <td className="px-2 py-1 text-right">{fmt.format(req.balance)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="border-t-[1.5px] border-black bg-black/5 font-semibold">
                <td colSpan={5} className="px-2 py-2">Total Payment to Date</td>
                <td className="px-2 py-2 text-right">{fmt.format(totalPaymentToDate)}</td>
                <td className="px-2 py-2 text-right">{fmt.format(remainingBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Order Log */}
      <div className="rounded-2xl border-[1.5px] border-black">
        <div className="border-b-[1.5px] border-black p-4">
          <h4 className="text-sm font-semibold">Change Order Log</h4>
        </div>
        <div className="overflow-auto p-4">
          <table className="w-full min-w-[1400px] text-sm border-collapse">
            <thead className="border-b border-black/20 bg-yellow-100">
              <tr>
                <th className="w-24 px-2 py-1 text-left">Elli CO #</th>
                <th className="w-28 px-2 py-1 text-left">Vendor Ticket #</th>
                <th className="w-28 px-2 py-1 text-right">Elli $$</th>
                <th className="w-28 px-2 py-1 text-left">Date Submitted</th>
                <th className="w-64 px-2 py-1 text-left">Regarding</th>
                <th className="w-32 px-2 py-1 text-right">Approved Amount</th>
                <th className="w-28 px-2 py-1 text-left">Date Approved</th>
                <th className="w-24 px-2 py-1 text-left">GC CO #</th>
                <th className="w-24 px-2 py-1 text-left">Added to Req</th>
                <th className="w-28 px-2 py-1 text-left">Billed to GC Req#</th>
                <th className="w-28 px-2 py-1 text-left">Paid Date</th>
                <th className="w-48 px-2 py-1 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co, idx) => (
                <tr key={idx} className="border-b border-black/10 hover:bg-black/5">
                  <td className="px-2 py-1">{co.elliCONumber}</td>
                  <td className="px-2 py-1">{co.vendorTicket}</td>
                  <td className="px-2 py-1 text-right">{fmt.format(co.elliAmount)}</td>
                  <td className="px-2 py-1">{co.dateSubmitted}</td>
                  <td className="px-2 py-1 whitespace-normal">{co.regarding}</td>
                  <td className="px-2 py-1 text-right">{fmt.format(co.approvedAmount)}</td>
                  <td className="px-2 py-1">{co.dateApproved}</td>
                  <td className="px-2 py-1">{co.gcCONumber}</td>
                  <td className="px-2 py-1">{co.addedToReq}</td>
                  <td className="px-2 py-1">{co.billedToGCReq}</td>
                  <td className="px-2 py-1">{co.paidDate}</td>
                  <td className="px-2 py-1 whitespace-normal">{co.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retainage Section */}
      {contractSummary.currentRetainagePercent > 0 && (
        <div className="rounded-2xl border-[1.5px] border-black">
          <div className="border-b-[1.5px] border-black p-4">
            <h4 className="text-sm font-semibold">Retainage Summary</h4>
          </div>
          <div className="p-4 grid gap-4 md:grid-cols-3 text-sm">
            <div className="border border-black/20 rounded-xl p-3">
              <div className="text-black/60 text-xs mb-1">Retainage Released to Date</div>
              <div className="font-semibold">{fmt.format(0)}</div>
            </div>
            <div className="border border-black/20 rounded-xl p-3">
              <div className="text-black/60 text-xs mb-1">Current Retainage</div>
              <div className="font-semibold">{fmt.format(currentRetainageAmount)}</div>
            </div>
            <div className="border border-black/20 rounded-xl p-3">
              <div className="text-black/60 text-xs mb-1">Remaining Retainage</div>
              <div className="font-semibold">{fmt.format(currentRetainageAmount)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;
