import React from "react";

// Reusable card wrapper for dark outlines and header
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border-[1.5px] border-black mb-4">
    <div className="border-b-[1.5px] border-black p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export interface AutopayBill {
  id: string;
  vendor: string;
  description: string;
  monthlyAmount: number;
  nextPaymentDate: string;
}

export const AutopayBillsView: React.FC<{ bills: AutopayBill[] }> = ({ bills }) => (
  <Card title="Autopay Bills">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-40 px-2 py-1">Vendor</th>
          <th className="w-60 px-2 py-1">Description</th>
          <th className="w-24 px-2 py-1 text-right">Monthly Amount</th>
          <th className="w-28 px-2 py-1">Next Payment</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((b) => (
          <tr key={b.id} className="border-b border-black/10 hover:bg-black/5">
            <td className="px-2 py-1">{b.vendor}</td>
            <td className="px-2 py-1">{b.description}</td>
            <td className="px-2 py-1 text-right">
              {b.monthlyAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </td>
            <td className="px-2 py-1">{b.nextPaymentDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export interface SubBill {
  id: string;
  vendor: string;
  poNumber: string;
  description: string;
  totalAmount: number;
  dueDate: string;
  percentDueThisMonth: number;
  paidPercent: number;
}

export const SubBillsView: React.FC<{ bills: SubBill[] }> = ({ bills }) => (
  <Card title="Subcontractor Bills">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-32 px-2 py-1">Vendor</th>
          <th className="w-24 px-2 py-1">PO #</th>
          <th className="w-48 px-2 py-1">Description</th>
          <th className="w-24 px-2 py-1 text-right">Total</th>
          <th className="w-24 px-2 py-1 text-right">Due Now</th>
          <th className="w-24 px-2 py-1 text-right">Paid</th>
          <th className="w-24 px-2 py-1 text-right">Balance</th>
          <th className="w-24 px-2 py-1">Due Date</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((b) => {
          const dueNow = b.totalAmount * b.percentDueThisMonth;
          const paidAmt = b.totalAmount * b.paidPercent;
          const balance = b.totalAmount - paidAmt;
          return (
            <tr key={b.id} className="border-b border-black/10 hover:bg-black/5">
              <td className="px-2 py-1">{b.vendor}</td>
              <td className="px-2 py-1">{b.poNumber}</td>
              <td className="px-2 py-1">{b.description}</td>
              <td className="px-2 py-1 text-right">
                {b.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {dueNow.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {paidAmt.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1">{b.dueDate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </Card>
);

export interface MaterialBill {
  id: string;
  vendor: string;
  poNumber: string;
  description: string;
  totalAmount: number;
  dueDate: string;
  percentDueThisMonth: number;
  paidPercent: number;
}

export const MaterialsBillsView: React.FC<{ bills: MaterialBill[] }> = ({ bills }) => (
  <Card title="Materials Bills">
    <table className="w-full table-fixed text-sm border-collapse">
      <thead className="border-b border-black/20">
        <tr>
          <th className="w-32 px-2 py-1">Vendor</th>
          <th className="w-24 px-2 py-1">PO #</th>
          <th className="w-48 px-2 py-1">Description</th>
          <th className="w-24 px-2 py-1 text-right">Total</th>
          <th className="w-24 px-2 py-1 text-right">Due Now</th>
          <th className="w-24 px-2 py-1 text-right">Paid</th>
          <th className="w-24 px-2 py-1 text-right">Balance</th>
          <th className="w-24 px-2 py-1">Due Date</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((b) => {
          const dueNow = b.totalAmount * b.percentDueThisMonth;
          const paidAmt = b.totalAmount * b.paidPercent;
          const balance = b.totalAmount - paidAmt;
          return (
            <tr key={b.id} className="border-b border-black/10 hover:bg-black/5">
              <td className="px-2 py-1">{b.vendor}</td>
              <td className="px-2 py-1">{b.poNumber}</td>
              <td className="px-2 py-1">{b.description}</td>
              <td className="px-2 py-1 text-right">
                {b.totalAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {dueNow.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {paidAmt.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1 text-right">
                {balance.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-2 py-1">{b.dueDate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </Card>
);
