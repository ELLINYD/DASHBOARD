import React, { useState, useRef } from "react";

// ===============================================
// Purchase Order & Change Order Form Components
//
// These standalone components mirror the existing RFQ form patterns
// from the main dashboard.  They provide editable forms and
// printable/ exportable previews for three document types:
//  - Fabricator Purchase Order
//  - Installer Purchase Order (with Terms & Conditions)
//  - Change Order (linked to an existing Purchase Order)
//
// To integrate these into your app:
//   1. Import the desired component into App.tsx (e.g. FabricatorPOCreateView).
//   2. Add a corresponding case in the main content switch (active === "create-fab-po").
//   3. Copy the helper functions (downloadBlob, etc.) from App.tsx if not already in scope.
//
// Note: These components operate independently of the global
// purchaseOrders dataset.  Save/submit handlers should be
// implemented according to your backend integration plan.

/* Terms & Conditions for Installer PO and Change Order
 * These strings are copied verbatim from the supplied Excel templates.
 */
export const INSTALLER_PO_TERMS: string = `B. Terms and Conditions:
1. ACCEPTANCE - (AK International) may accept this offer only by signing and returning this Purchase Order to Elli NY Design, without modification, within three days.
2. CANCELLATION - Elli NY Design may cancel this Purchase Order, without cost, if (a) ELLI is not awarded the Prime Contract, or (b) the Contractor (AK International) fails to comply with each term of the Purchase Order.  ELLI may also cancel this Contract PO for its own convenience.  In that case Elli's liability shall be limited to payment at the prices set forth in this Contract/PO, for that portion of the work which had been manufactured by the date of termination and which do not constitute stock.
3. INSURANCE - ELLI may cancel this Purchase Order, if the Contractor (AK International) fails to furnish and maintain General Liability, Workers Comopensation, and Automobile Insurance as per the specified attached sample certificate and also naming Elli NY Design Corp. as additional insured.
4. WARRANTIES -  (AK International) warrants that the Work a) are free from all defects in workmanship and materials, b) complies with all warranties imposed by law, (d) comply with all applicable laws, (e) conforms to all samples.  The Contractor (AK International) agrees to remedy any defect in the Work within one year from acceptance by the Project Owner, or within the applicable period established by the Prime Contract whichever is longer.
5. INDEMNIFICATION -  (AK International) agrees to defend, protect, indemnify and hold harmless the Project Owner, Owner and ELLI, their respective officers directors, employees, agents, invitees, and servants (collectively , "Indemnities") from and against each and every claim demand or cause of action of any liability cost, expenses (including but not limited to reasonable attorney's fees and expenses incurred in the defense of the Indemnities), damages or loss in connection therewith , which may be made or asserted by the Contractor, Contractor's  employees or agents, sub-contractors, their employees or agents of any third parties (including but not limited to the Indemnities) on account of personal injuries or death or property damage caused by alleged to caused by, arising out of, or any way incidental, or connection with the performance of the Work hereunder and undertaking of the Contractor of all Work, labor services including the supply of materials and equipment, tools etc, as provided between Elli and (AK International) and the agreement between the Project Owner and Elli.
6. PRICE - The purchase price is firm and includes payment to the Contractor (AK International) for all its obligations under this Purchase Order.  In addition the purchase price includes all taxes applicable to the Work.
7. TERMS OF PAYMENT - Payment of the contractor's invoices shall be made within 15 days upon receipt of payment from GC, with 10% retainage payable upon completion of punch-list and owner acceptance.
8. DEFAULT REMEDIES - If the Contractor (AK International) breaches this Purchase Order, or dissolves, is liquidated, or is placed in bankruptcy, receivership of assignment for the benefit of creditors, ELLI may, without notice, declare the Contractor (AK International) in default under this Purchase Order.  Upon default, Elli may, without notice, (a) cancel this Purchase Order without cost to ELLI, (b) require that all sums owing to ELLI be immediately paid and (c.) any other remedy available under this Purchase Order and applicable law.  In any action for breach of this Contract, Elli shall be entitled to its reasonable counsel fee and expenses.
9. COMPLIANCE WITH LAW - The Contractor shall comply with all applicable provision of federal, state, and local laws and regulations.
10. ASSIGNMENT - This Purchase Order may not be assigned, transferred or hypothecated by the Contractor without ELLI's prior written approval.  (10a) MERGER. This Purchase Order is the complete expression of the agreement between ELLI and the Supplier.  No Prior statements,  course of dealings, trade usage custom, or practice shall supplement the terms of this Purchase Order.
11. GOVERNING LAW - This Purchase Order shall be governed by the laws of the State of New York.
12. MODIFICATION - This Purchase Order may not be modified orally.  All Modification must be in writing and signed by ELLI and the Contractor (AK International).
13. LAYOUT: This contract Purchase Order is inclusive of layout as required for millwork installation as per scope and coordination with other trades.
14. PROTECTION - This contractor is responsible to protect all work and material delivered and installed on site.
15. DELIVERY - Contractor shall be responsible for delivering and properly shaking out all materials at the two designated locations identified by ELLI NY Design, Corp.
16. PUNCHLIST - Ten percent (10%) of the contract amount will be withheld as retainage until Contractor has satisfactorily completed all punchlist items to the approval of ELLI NY Design.
17. ADDITIONAL WORK - Contractor shall not proceed with any additional work without prior written authorization from ELLI NY Design, Corp. Any work performed without such written approval shall be at Contractor's sole cost and expense.
IN WITNESS WHEREOF, the parties hereto have hereunto set their hands and seals the day and year first above written.
Please sign and return within three business days of the above date.
`;

export const CHANGE_ORDER_TERMS: string = `B. Terms and Conditions:
1. ACCEPTANCE - (American Wood Installers, Inc.) may accept this offer only by signing and returning this Purchase Order to Elli NY Design, without modification, within three days.
2. CANCELLATION - Elli NY Design may cancel this Purchase Order, without cost, if (a) ELLI is not awarded the Prime Contract, or (b) the Contractor (American Wood Installers, Inc.) fails to comply with each term of the Purchase Order.  ELLI may also cancel this Contract PO for its own convenience.  In that case Elli's liability shall be limited to payment at the prices set forth in this Contract/PO, for that portion of the work which had been manufactured by the date of termination and which do not constitute stock.
3. INSURANCE - ELLI may cancel this Purchase Order, if the Contractor (American Wood Installers, Inc.) fails to furnish and maintain General Liability, Workers Comopensation, and Automobile Insurance as per the specified attached sample certificate and also naming Elli NY Design Corp. as additional insured.
4. WARRANTIES -  (American Wood Installers, Inc.) warrants that the Work a) are free from all defects in workmanship and materials, b) complies with all warranties imposed by law, (d) comply with all applicable laws, (e) conforms to all samples.  The Contractor (American Wood Installers, Inc.) agrees to remedy any defect in the Work within one year from acceptance by the Project Owner, or within the applicable period established by the Prime Contract whichever is longer.
5. INDEMNIFICATION -  (American Wood Installers, Inc.) agrees to defend, protect, indemnify and hold harmless the Project Owner, Owner and ELLI, their respective officers directors, employees, agents, invitees, and servants (collectively , "Indemnities") from and against each and every claim demand or cause of action of any liability cost, expenses (including but not limited to reasonable attorney's fees and expenses incurred in the defense of the Indemnities), damages or loss in connection therewith , which may be made or asserted by the Contractor, Contractor's  employees or agents, sub-contractors, their employees or agents of any third parties (including but not limited to the Indemnities) on account of personal injuries or death or property damage caused by alleged to caused by, arising out of, or any way incidental, or connection with the performance of the Work hereunder and undertaking of the Contractor of all Work, labor services including the supply of materials and equipment, tools etc, as provided between Elli and (American Wood Installers, Inc.) and the agreement between the Project Owner and Elli.
6. PRICE - The purchase price is firm and includes payment to the Contractor (American Wood Installers, Inc.) for all its obligations under this Purchase Order.  In addition the purchase price includes all taxes applicable to the Work.
7. TERMS OF PAYMENT - Payment of the contractor's invoices shall be made within 15 days upon receipt of payment from GC, with 10% retainage payable upon completion of punch-list and owner acceptance.
8. DEFAULT REMEDIES - If the Contractor (American Wood Installers, Inc.) breaches this Purchase Order, or dissolves, is liquidated, or is placed in bankruptcy, receivership of assignment for the benefit of creditors, ELLI may, without notice, declare the Contractor (American Wood Installers, Inc.) in default under this Purchase Order.  Upon default, Elli may, without notice, (a) cancel this Purchase Order without cost to ELLI, (b) require that all sums owing to ELLI be immediately paid and (c.) any other remedy available under this Purchase Order and applicable law.  In any action for breach of this Contract, Elli shall be entitled to its reasonable counsel fee and expenses.
9. COMPLIANCE WITH LAW - The Contractor shall comply with all applicable provision of federal, state, and local laws and regulations.
10. ASSIGNMENT - This Purchase Order may not be assigned, transferred or hypothecated by the Contractor without ELLI's prior written approval.  (10a) MERGER. This Purchase Order is the complete expression of the agreement between ELLI and the Supplier.  No Prior statements,  course of dealings, trade usage custom, or practice shall supplement the terms of this Purchase Order.
11. GOVERNING LAW - This Purchase Order shall be governed by the laws of the State of New York.
12. MODIFICATION - This Purchase Order may not be modified orally.  All Modification must be in writing and signed by ELLI and the Contractor (American Wood Installers, Inc.).
`;

// Helper to download a text/html document as a file.
function downloadBlob(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate a simple .doc document for a PO-like object.  Accepts
// an object with fields id, date, vendorName, vendorAddress,
// vendorPhone, projectNumber, projectName, deliverTo, items (array)
// and notes.  Feel free to extend this for your own needs.
function generatePoDoc(po: any): string {
  const total = po.items.reduce((sum: number, it: any) => {
    const t = parseFloat(it.total || String(Number(it.qty) * Number(it.unitPrice) || 0));
    return sum + (isNaN(t) ? 0 : t);
  }, 0);
  const rowsHtml = po.items
    .map(
      (it: any) => `
        <tr>
          <td>${it.qty || ""}</td>
          <td>${it.unit || ""}</td>
          <td>${it.description || ""}</td>
          <td style="text-align:right">${it.unitPrice || ""}</td>
          <td style="text-align:right">${it.total || ""}</td>
        </tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${po.id}</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;color:#000;margin:20px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #000;padding:4px;font-size:12px} th{background:#f2f2f2}</style>
    </head><body>
    <h2>Purchase Order</h2>
    <p><b>PO #:</b> ${po.id}<br/>
    <b>Date:</b> ${po.date}<br/>
    <b>Project:</b> ${po.projectNumber || ""} — ${po.projectName || ""}<br/>
    <b>Vendor:</b> ${po.vendorName || ""}<br/>
    <b>Deliver To:</b> ${po.deliverTo || ""}</p>
    <table><thead><tr><th>QTY</th><th>Unit</th><th>Description</th><th>Unit Price</th><th>Line Total</th></tr></thead><tbody>
    ${rowsHtml}
    <tr><td colspan="4" style="text-align:right"><b>Total:</b></td><td style="text-align:right">${total.toFixed(2)}</td></tr>
    </tbody></table>
    ${po.notes ? `<h4>Notes</h4><p>${po.notes}</p>` : ""}
    </body></html>`;
}

// Generate a simple .xls document (HTML table) for a PO-like object.
function generatePoXls(po: any): string {
  const total = po.items.reduce((sum: number, it: any) => {
    const t = parseFloat(it.total || String(Number(it.qty) * Number(it.unitPrice) || 0));
    return sum + (isNaN(t) ? 0 : t);
  }, 0);
  const rowsHtml = po.items
    .map(
      (it: any) => `
        <tr>
          <td>${it.qty || ""}</td>
          <td>${it.unit || ""}</td>
          <td>${it.description || ""}</td>
          <td>${it.unitPrice || ""}</td>
          <td>${it.total || ""}</td>
        </tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
    <table border="1" cellspacing="0" cellpadding="4">
    <tr><th colspan="2">Purchase Order</th></tr>
    <tr><td>PO #</td><td>${po.id}</td></tr>
    <tr><td>Date</td><td>${po.date}</td></tr>
    <tr><td>Project</td><td>${po.projectNumber || ""} — ${po.projectName || ""}</td></tr>
    <tr><td>Vendor</td><td>${po.vendorName || ""}</td></tr>
    <tr><td>Deliver To</td><td>${po.deliverTo || ""}</td></tr>
    <tr><th colspan="5">Items</th></tr>
    <tr><th>QTY</th><th>Unit</th><th>Description</th><th>Unit Price</th><th>Line Total</th></tr>
    ${rowsHtml}
    <tr><td colspan="4" align="right"><b>Total</b></td><td>${total.toFixed(2)}</td></tr>
    </table>
    ${po.notes ? `<p><b>Notes:</b> ${po.notes}</p>` : ""}
    </body></html>`;
}

/**
 * Fabricator Purchase Order creation form.
 * Mirrors the RFQ form structure: edit/preview toggle, line items, export to
 * Word/Excel, and print as PDF.  Does not include Terms & Conditions.
 */
export const FabricatorPOCreateView: React.FC = () => {
  const [form, setForm] = useState<any>({
    id: "PO-FAB-" + Math.floor(10000 + Math.random() * 89999),
    date: new Date().toISOString().slice(0, 10),
    projectNumber: "",
    projectName: "",
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    deliverTo: "",
    items: [
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
    ],
    notes: "",
  });
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  const updateField = (key: string, value: string) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };
  const updateItem = (idx: number, key: string, value: string) => {
    setForm((f: any) => {
      const items = f.items.slice();
      items[idx] = { ...items[idx], [key]: value };
      // update line total if qty & unit price entered
      const qty = parseFloat(items[idx].qty || "0");
      const price = parseFloat(items[idx].unitPrice || "0");
      const total = !isNaN(qty) && !isNaN(price) ? qty * price : "";
      items[idx].total = total === "" ? "" : total.toFixed(2);
      return { ...f, items };
    });
  };
  const addRow = () => {
    setForm((f: any) => ({ ...f, items: [...f.items, { qty: "", unit: "", description: "", unitPrice: "", total: "" }] }));
  };
  const removeRow = (idx: number) => {
    setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }));
  };
  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "Print", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`<html><head><title>${form.id}</title>`);
        printWindow.document.write("<style>body{font-family:Arial,sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #000;padding:4px;font-size:12px} th{background:#f2f2f2}</style>");
        printWindow.document.write("</head><body>");
        printWindow.document.write(printContent);
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };
  const exportDoc = () => {
    const html = generatePoDoc(form);
    downloadBlob(`${form.id}.doc`, "application/msword", html);
  };
  const exportXls = () => {
    const html = generatePoXls(form);
    downloadBlob(`${form.id}.xls`, "application/vnd.ms-excel", html);
  };

  const total = form.items.reduce((sum: number, it: any) => sum + (parseFloat(it.total) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-black/60">Fill the fields, toggle Preview, then Print/Save as needed.</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode((p) => !p)}
            className="rounded-full border border-black px-3 py-2 text-sm"
          >
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </button>
          <button onClick={exportDoc} className="rounded-full border border-black px-3 py-2 text-sm">
            Word (.doc)
          </button>
          <button onClick={exportXls} className="rounded-full border border-black px-3 py-2 text-sm">
            Excel (.xls)
          </button>
          <button onClick={handlePrint} className="rounded-full border border-black px-3 py-2 text-sm">
            Print / PDF
          </button>
        </div>
      </div>
      {!previewMode && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">PO #</label>
              <input value={form.id} onChange={(e) => updateField("id", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Date</label>
              <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project #</label>
              <input value={form.projectNumber} onChange={(e) => updateField("projectNumber", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project Name</label>
              <input value={form.projectName} onChange={(e) => updateField("projectName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Vendor</label>
              <input value={form.vendorName} onChange={(e) => updateField("vendorName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
              <input value={form.vendorAddress} onChange={(e) => updateField("vendorAddress", e.target.value)} placeholder="Address" className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
              <input value={form.vendorPhone} onChange={(e) => updateField("vendorPhone", e.target.value)} placeholder="Phone" className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Deliver To</label>
              <input value={form.deliverTo} onChange={(e) => updateField("deliverTo", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
          </div>
          <div>
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs uppercase">
                  <th className="px-2 py-1 w-12">QTY</th>
                  <th className="px-2 py-1 w-16">Unit</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1 w-24">Unit Price</th>
                  <th className="px-2 py-1 w-24">Line Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-b border-black/20 text-sm">
                    <td className="px-2 py-1">
                      <input type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={it.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" />
                    </td>
                    <td className="px-2 py-1">
                      <input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" />
                    </td>
                    <td className="px-2 py-1 text-right">
                      {it.total}
                    </td>
                    <td className="px-2 py-1">
                      <button onClick={() => removeRow(idx)} className="text-xs text-red-600">×</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="p-2 text-center">
                    <button onClick={addRow} className="rounded-full border border-black px-3 py-1 text-xs">+ Add Row</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Notes</label>
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={4} className="w-full rounded-xl border border-black/40 p-2 text-sm"></textarea>
          </div>
        </div>
      )}
      {/* Preview */}
      {previewMode && (
        <div ref={printRef} className="border border-black rounded-xl overflow-hidden">
          <div className="border-b border-black p-4 flex justify-between">
            <div>
              <h3 className="text-lg font-bold">PURCHASE ORDER</h3>
              <p className="text-[11px] text-black/60">ELLI NY DESIGN • 51-05 Flushing Ave, Maspeth, NY 11378 • 718-418-9002</p>
            </div>
            <div className="text-sm text-right">
              <div className="text-xs">PO #</div>
              <div className="font-semibold">{form.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="border-r border-black p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Project</div>
              <div className="font-semibold">{form.projectNumber} — {form.projectName}</div>
            </div>
            <div className="p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Vendor</div>
              <div className="font-semibold">{form.vendorName}</div>
              <div>{form.vendorAddress}</div>
              <div>{form.vendorPhone}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-b border-black">
            <div className="border-r border-black p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Date</span>
              <span className="font-semibold">{form.date}</span>
            </div>
            <div className="border-r border-black p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Deliver To</span>
              <span className="font-semibold">{form.deliverTo}</span>
            </div>
            <div className="p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Total</span>
              <span className="font-semibold">{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-3">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-2 py-1 text-left w-12">QTY</th>
                  <th className="px-2 py-1 text-left w-16">Unit</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-right w-24">Unit Price</th>
                  <th className="px-2 py-1 text-right w-24">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-t border-black/20">
                    <td className="px-2 py-1">{it.qty}</td>
                    <td className="px-2 py-1">{it.unit}</td>
                    <td className="px-2 py-1">{it.description}</td>
                    <td className="px-2 py-1 text-right">{it.unitPrice}</td>
                    <td className="px-2 py-1 text-right">{it.total}</td>
                  </tr>
                ))}
                <tr className="border-t border-black/40">
                  <td colSpan={4} className="px-2 py-1 text-right font-semibold">TOTAL</td>
                  <td className="px-2 py-1 text-right font-semibold">{total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {form.notes && (
            <div className="p-3 border-t border-black">
              <div className="font-semibold text-sm mb-1">Notes</div>
              <div className="text-sm whitespace-pre-wrap">{form.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Installer Purchase Order creation form.
 * Extends the Fabricator form with a Scope of Work field and
 * appends the Terms & Conditions page when printing or exporting.
 */
export const InstallerPOCreateView: React.FC = () => {
  // Reuse the Fabricator form state and logic but add scopeOfWork
  const [form, setForm] = useState<any>({
    id: "PO-INST-" + Math.floor(10000 + Math.random() * 89999),
    date: new Date().toISOString().slice(0, 10),
    projectNumber: "",
    projectName: "",
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    deliverTo: "",
    scopeOfWork: "",
    items: [
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
      { qty: "", unit: "", description: "", unitPrice: "", total: "" },
    ],
    notes: "",
  });
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);
  const updateField = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));
  const updateItem = (idx: number, key: string, value: string) => {
    setForm((f: any) => {
      const items = f.items.slice();
      items[idx] = { ...items[idx], [key]: value };
      const qty = parseFloat(items[idx].qty || "0");
      const price = parseFloat(items[idx].unitPrice || "0");
      const total = !isNaN(qty) && !isNaN(price) ? qty * price : "";
      items[idx].total = total === "" ? "" : total.toFixed(2);
      return { ...f, items };
    });
  };
  const addRow = () => setForm((f: any) => ({ ...f, items: [...f.items, { qty: "", unit: "", description: "", unitPrice: "", total: "" }] }));
  const removeRow = (idx: number) => setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }));
  const total = form.items.reduce((sum: number, it: any) => sum + (parseFloat(it.total) || 0), 0);
  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current.innerHTML;
      const win = window.open("", "Print", "width=800,height=600");
      if (win) {
        win.document.write(`<html><head><title>${form.id}</title>`);
        win.document.write("<style>body{font-family:Arial,sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #000;padding:4px;font-size:12px} th{background:#f2f2f2}</style>");
        win.document.write("</head><body>");
        win.document.write(content);
        win.document.write("<hr/><pre style='white-space:pre-wrap;font-size:10px'>" + INSTALLER_PO_TERMS + "</pre>");
        win.document.write("</body></html>");
        win.document.close();
        win.focus();
        win.print();
        win.close();
      }
    }
  };
  const exportDoc = () => {
    const poDoc = generatePoDoc(form);
    // Append terms page separated by a page break using Word's CSS
    const html = poDoc.replace('</body>', `<hr style="page-break-before:always"><pre style="white-space:pre-wrap;font-size:10px">${INSTALLER_PO_TERMS}</pre></body>`);
    downloadBlob(`${form.id}.doc`, "application/msword", html);
  };
  const exportXls = () => {
    const poXls = generatePoXls(form);
    // Terms cannot easily be represented in a single Excel sheet; export only first page
    downloadBlob(`${form.id}.xls`, "application/vnd.ms-excel", poXls);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-black/60">Fill the fields, toggle Preview, then Print/Save. Terms & Conditions will be appended automatically.</div>
        <div className="flex gap-2">
          <button onClick={() => setPreviewMode((p) => !p)} className="rounded-full border border-black px-3 py-2 text-sm">{previewMode ? "Edit Mode" : "Preview Mode"}</button>
          <button onClick={exportDoc} className="rounded-full border border-black px-3 py-2 text-sm">Word (.doc)</button>
          <button onClick={exportXls} className="rounded-full border border-black px-3 py-2 text-sm">Excel (.xls)</button>
          <button onClick={handlePrint} className="rounded-full border border-black px-3 py-2 text-sm">Print / PDF</button>
        </div>
      </div>
      {!previewMode && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">PO #</label>
              <input value={form.id} onChange={(e) => updateField("id", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Date</label>
              <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project #</label>
              <input value={form.projectNumber} onChange={(e) => updateField("projectNumber", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project Name</label>
              <input value={form.projectName} onChange={(e) => updateField("projectName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Vendor</label>
              <input value={form.vendorName} onChange={(e) => updateField("vendorName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
              <input value={form.vendorAddress} onChange={(e) => updateField("vendorAddress", e.target.value)} placeholder="Address" className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
              <input value={form.vendorPhone} onChange={(e) => updateField("vendorPhone", e.target.value)} placeholder="Phone" className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Deliver To</label>
              <input value={form.deliverTo} onChange={(e) => updateField("deliverTo", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-black/60">Scope of Work</label>
              <textarea value={form.scopeOfWork} onChange={(e) => updateField("scopeOfWork", e.target.value)} rows={4} className="w-full rounded-xl border border-black/40 p-2 text-sm"></textarea>
            </div>
          </div>
          <div>
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs uppercase">
                  <th className="px-2 py-1 w-12">QTY</th>
                  <th className="px-2 py-1 w-16">Unit</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1 w-24">Unit Price</th>
                  <th className="px-2 py-1 w-24">Line Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-b border-black/20 text-sm">
                    <td className="px-2 py-1"><input type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1"><input value={it.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1"><input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1"><input type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1 text-right">{it.total}</td>
                    <td className="px-2 py-1"><button onClick={() => removeRow(idx)} className="text-xs text-red-600">×</button></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="p-2 text-center">
                    <button onClick={addRow} className="rounded-full border border-black px-3 py-1 text-xs">+ Add Row</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Notes</label>
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-black/40 p-2 text-sm"></textarea>
          </div>
        </div>
      )}
      {previewMode && (
        <div ref={printRef} className="border border-black rounded-xl overflow-hidden">
          <div className="border-b border-black p-4 flex justify-between">
            <div>
              <h3 className="text-lg font-bold">INSTALLER PURCHASE ORDER</h3>
              <p className="text-[11px] text-black/60">ELLI NY DESIGN • 51-05 Flushing Ave, Maspeth, NY 11378 • 718-418-9002</p>
            </div>
            <div className="text-sm text-right">
              <div className="text-xs">PO #</div>
              <div className="font-semibold">{form.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="border-r border-black p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Project</div>
              <div className="font-semibold">{form.projectNumber} — {form.projectName}</div>
            </div>
            <div className="p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Vendor</div>
              <div className="font-semibold">{form.vendorName}</div>
              <div>{form.vendorAddress}</div>
              <div>{form.vendorPhone}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-b border-black">
            <div className="border-r border-black p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Date</span>
              <span className="font-semibold">{form.date}</span>
            </div>
            <div className="border-r border-black p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Deliver To</span>
              <span className="font-semibold">{form.deliverTo}</span>
            </div>
            <div className="p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Total</span>
              <span className="font-semibold">{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-3 border-b border-black">
            <div className="font-semibold text-sm mb-1">Scope of Work</div>
            <div className="text-sm whitespace-pre-wrap">{form.scopeOfWork}</div>
          </div>
          <div className="p-3">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-2 py-1 text-left w-12">QTY</th>
                  <th className="px-2 py-1 text-left w-16">Unit</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-right w-24">Unit Price</th>
                  <th className="px-2 py-1 text-right w-24">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-t border-black/20">
                    <td className="px-2 py-1">{it.qty}</td>
                    <td className="px-2 py-1">{it.unit}</td>
                    <td className="px-2 py-1">{it.description}</td>
                    <td className="px-2 py-1 text-right">{it.unitPrice}</td>
                    <td className="px-2 py-1 text-right">{it.total}</td>
                  </tr>
                ))}
                <tr className="border-t border-black/40">
                  <td colSpan={4} className="px-2 py-1 text-right font-semibold">TOTAL</td>
                  <td className="px-2 py-1 text-right font-semibold">{total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {form.notes && (
            <div className="p-3 border-t border-black">
              <div className="font-semibold text-sm mb-1">Notes</div>
              <div className="text-sm whitespace-pre-wrap">{form.notes}</div>
            </div>
          )}
          <div className="p-3 text-[10px] bg-black/5 border-t border-black whitespace-pre-wrap">
            {/* Terms & Conditions will be appended when printing/exporting */}
            <em>Terms & Conditions will be appended in the exported document or printed PDF.</em>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Change Order creation form.
 * Provides fields to reference an existing PO and capture additional work.
 * Includes contract sum breakdown and appends terms & conditions.
 */
export const ChangeOrderCreateView: React.FC = () => {
  const [form, setForm] = useState<any>({
    id: "CO-" + Math.floor(1000 + Math.random() * 8999),
    date: new Date().toISOString().slice(0, 10),
    originalPo: "",
    vendorName: "",
    projectNumber: "",
    projectName: "",
    description: "",
    items: [ { qty: "", description: "", unitPrice: "", total: "" }, { qty: "", description: "", unitPrice: "", total: "" } ],
    originalContractSum: "",
    previousCoNetChange: "",
    priorContractSum: "",
    thisCoChange: "",
    newContractSum: "",
    notes: "",
  });
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);
  const updateField = (key: string, value: string) => setForm((f: any) => ({ ...f, [key]: value }));
  const updateItem = (idx: number, key: string, value: string) => {
    setForm((f: any) => {
      const items = f.items.slice();
      items[idx] = { ...items[idx], [key]: value };
      const qty = parseFloat(items[idx].qty || "0");
      const price = parseFloat(items[idx].unitPrice || "0");
      const total = !isNaN(qty) && !isNaN(price) ? qty * price : "";
      items[idx].total = total === "" ? "" : total.toFixed(2);
      return { ...f, items };
    });
  };
  const addRow = () => setForm((f: any) => ({ ...f, items: [...f.items, { qty: "", description: "", unitPrice: "", total: "" }] }));
  const removeRow = (idx: number) => setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }));
  const total = form.items.reduce((sum: number, it: any) => sum + (parseFloat(it.total) || 0), 0);
  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current.innerHTML;
      const win = window.open("", "Print", "width=800,height=600");
      if (win) {
        win.document.write(`<html><head><title>${form.id}</title>`);
        win.document.write("<style>body{font-family:Arial,sans-serif} table{width:100%;border-collapse:collapse} th,td{border:1px solid #000;padding:4px;font-size:12px} th{background:#f2f2f2}</style>");
        win.document.write("</head><body>");
        win.document.write(content);
        win.document.write("<hr/><pre style='white-space:pre-wrap;font-size:10px'>" + CHANGE_ORDER_TERMS + "</pre>");
        win.document.write("</body></html>");
        win.document.close();
        win.focus();
        win.print();
        win.close();
      }
    }
  };
  const exportDoc = () => {
    // For simplicity, reuse generatePoDoc for the CO items section
    const poDoc = generatePoDoc({
      id: form.id,
      date: form.date,
      projectNumber: form.projectNumber,
      projectName: form.projectName,
      vendorName: form.vendorName,
      deliverTo: "",
      items: form.items,
      notes: form.description,
    });
    const html = poDoc.replace('</body>', `<hr style="page-break-before:always"><pre style="white-space:pre-wrap;font-size:10px">${CHANGE_ORDER_TERMS}</pre></body>`);
    downloadBlob(`${form.id}.doc`, "application/msword", html);
  };
  const exportXls = () => {
    const poXls = generatePoXls({
      id: form.id,
      date: form.date,
      projectNumber: form.projectNumber,
      projectName: form.projectName,
      vendorName: form.vendorName,
      deliverTo: "",
      items: form.items,
      notes: form.description,
    });
    downloadBlob(`${form.id}.xls`, "application/vnd.ms-excel", poXls);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-black/60">Create a Change Order.  Fields below mirror your CO generator template.  Terms & Conditions will be appended automatically.</div>
        <div className="flex gap-2">
          <button onClick={() => setPreviewMode((p) => !p)} className="rounded-full border border-black px-3 py-2 text-sm">{previewMode ? "Edit Mode" : "Preview Mode"}</button>
          <button onClick={exportDoc} className="rounded-full border border-black px-3 py-2 text-sm">Word (.doc)</button>
          <button onClick={exportXls} className="rounded-full border border-black px-3 py-2 text-sm">Excel (.xls)</button>
          <button onClick={handlePrint} className="rounded-full border border-black px-3 py-2 text-sm">Print / PDF</button>
        </div>
      </div>
      {!previewMode && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">CO #</label>
              <input value={form.id} onChange={(e) => updateField("id", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Date</label>
              <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Original PO #</label>
              <input value={form.originalPo} onChange={(e) => updateField("originalPo", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Vendor</label>
              <input value={form.vendorName} onChange={(e) => updateField("vendorName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project #</label>
              <input value={form.projectNumber} onChange={(e) => updateField("projectNumber", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Project Name</label>
              <input value={form.projectName} onChange={(e) => updateField("projectName", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-black/60">Description / Additional Work</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full rounded-xl border border-black/40 p-2 text-sm"></textarea>
            </div>
          </div>
          <div>
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs uppercase">
                  <th className="px-2 py-1 w-12">QTY</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1 w-24">Unit Price</th>
                  <th className="px-2 py-1 w-24">Line Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-b border-black/20 text-sm">
                    <td className="px-2 py-1"><input type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1"><input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1"><input type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-0.5 outline-none" /></td>
                    <td className="px-2 py-1 text-right">{it.total}</td>
                    <td className="px-2 py-1"><button onClick={() => removeRow(idx)} className="text-xs text-red-600">×</button></td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} className="p-2 text-center"><button onClick={addRow} className="rounded-full border border-black px-3 py-1 text-xs">+ Add Line</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Original Contract Sum</label>
              <input type="number" value={form.originalContractSum} onChange={(e) => updateField("originalContractSum", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Net Change by Previous CO</label>
              <input type="number" value={form.previousCoNetChange} onChange={(e) => updateField("previousCoNetChange", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Contract Sum Prior to this CO</label>
              <input type="number" value={form.priorContractSum} onChange={(e) => updateField("priorContractSum", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-black/60">Net Change this CO</label>
              <input type="number" value={form.thisCoChange} onChange={(e) => updateField("thisCoChange", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-black/60">New Contract Sum</label>
              <input type="number" value={form.newContractSum} onChange={(e) => updateField("newContractSum", e.target.value)} className="w-full border-b border-black bg-transparent px-1 py-1 text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60">Notes</label>
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-black/40 p-2 text-sm"></textarea>
          </div>
        </div>
      )}
      {previewMode && (
        <div ref={printRef} className="border border-black rounded-xl overflow-hidden">
          <div className="border-b border-black p-4 flex justify-between">
            <div>
              <h3 className="text-lg font-bold">CHANGE ORDER</h3>
              <p className="text-[11px] text-black/60">ELLI NY DESIGN • 51-05 Flushing Ave, Maspeth, NY 11378 • 718-418-9002</p>
            </div>
            <div className="text-sm text-right">
              <div className="text-xs">CO #</div>
              <div className="font-semibold">{form.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="border-r border-black p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Original PO</div>
              <div className="font-semibold">{form.originalPo}</div>
            </div>
            <div className="p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Vendor</div>
              <div className="font-semibold">{form.vendorName}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-black">
            <div className="border-r border-black p-3 text-sm">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Project</div>
              <div className="font-semibold">{form.projectNumber} — {form.projectName}</div>
            </div>
            <div className="p-3 text-sm flex justify-between">
              <span className="text-black/60 text-[10px] uppercase">Date</span>
              <span className="font-semibold">{form.date}</span>
            </div>
          </div>
          <div className="p-3 border-b border-black">
            <div className="font-semibold text-sm mb-1">Description / Additional Work</div>
            <div className="text-sm whitespace-pre-wrap">{form.description}</div>
          </div>
          <div className="p-3">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-2 py-1 text-left w-12">QTY</th>
                  <th className="px-2 py-1 text-left">Description</th>
                  <th className="px-2 py-1 text-right w-24">Unit Price</th>
                  <th className="px-2 py-1 text-right w-24">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it: any, idx: number) => (
                  <tr key={idx} className="border-t border-black/20">
                    <td className="px-2 py-1">{it.qty}</td>
                    <td className="px-2 py-1">{it.description}</td>
                    <td className="px-2 py-1 text-right">{it.unitPrice}</td>
                    <td className="px-2 py-1 text-right">{it.total}</td>
                  </tr>
                ))}
                <tr className="border-t border-black/40">
                  <td colSpan={3} className="px-2 py-1 text-right font-semibold">TOTAL</td>
                  <td className="px-2 py-1 text-right font-semibold">{total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-black text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between"><span>Original Contract Sum:</span><span>{form.originalContractSum}</span></div>
                <div className="flex justify-between"><span>Net Change by Previous CO:</span><span>{form.previousCoNetChange}</span></div>
                <div className="flex justify-between"><span>Contract Sum Prior to this CO:</span><span>{form.priorContractSum}</span></div>
              </div>
              <div>
                <div className="flex justify-between"><span>Net Change this CO:</span><span>{form.thisCoChange}</span></div>
                <div className="flex justify-between font-semibold"><span>New Contract Sum:</span><span>{form.newContractSum}</span></div>
              </div>
            </div>
          </div>
          {form.notes && (
            <div className="p-3 border-t border-black">
              <div className="font-semibold text-sm mb-1">Notes</div>
              <div className="text-sm whitespace-pre-wrap">{form.notes}</div>
            </div>
          )}
          <div className="p-3 text-[10px] bg-black/5 border-t border-black whitespace-pre-wrap">
            <em>Terms & Conditions will be appended in the exported document or printed PDF.</em>
          </div>
        </div>
      )}
    </div>
  );
};
