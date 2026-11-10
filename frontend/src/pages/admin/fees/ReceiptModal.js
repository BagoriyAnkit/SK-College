import React, { useState } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  User,
  GraduationCap
} from "lucide-react";

export default function ReceiptModal({ open, onClose, fees, payment, paymentIndex = 0 }) {
  const [selectedIdx, setSelectedIdx] = useState(paymentIndex);

  if (!open) return null;

  const paymentsList = Array.isArray(fees?.payments) ? fees.payments : [];

  // Determine active payment
  const activeIdx =
    selectedIdx >= 0 && selectedIdx < paymentsList.length
      ? selectedIdx
      : paymentsList.length > 0
      ? paymentsList.length - 1
      : 0;

  const activePayment = paymentsList[activeIdx] || payment || {};

  // Resolve student display name
  const studentDisplayName =
    fees?.studentName ||
    fees?.StudentName ||
    fees?.studentId?.StudentName ||
    fees?.studentId?.studentName ||
    activePayment.paidBy ||
    "Student";

  const courseDisplayName =
    fees?.courseName ||
    (fees?.studentId && fees?.studentId?.Course) ||
    "General Academic Program";

  const rollNumber =
    fees?.studentId?.RollNumber ||
    fees?.studentId?.rollNumber ||
    "N/A";

  const totalCourseFee = Number(fees?.totalFees || 0);
  const discount = Number(fees?.discount || 0);
  const netPayable = Math.max(0, totalCourseFee - discount);
  const amountPaidInThisReceipt = Number(activePayment.amount || fees?.paidAmount || 0);

  // Compute remaining balance after this specific payment
  let remainingBalance = activePayment.balance;
  if (remainingBalance === undefined || remainingBalance === null) {
    if (paymentsList.length > 0) {
      let cumulative = 0;
      for (let i = 0; i <= activeIdx && i < paymentsList.length; i++) {
        cumulative += Number(paymentsList[i].amount || 0);
      }
      remainingBalance = Math.max(0, netPayable - cumulative);
    } else {
      remainingBalance = Number(fees?.dueAmount !== undefined ? fees.dueAmount : Math.max(0, netPayable - amountPaidInThisReceipt));
    }
  }

  const receiptNumber =
    activePayment.receiptNo ||
    (fees?._id ? `REC-${fees._id.toString().slice(-6).toUpperCase()}` : "REC-OFFICIAL");

  const paymentDate = activePayment.paymentDate || fees?.paymentDate
    ? new Date(activePayment.paymentDate || fees?.paymentDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : new Date().toLocaleDateString("en-GB");

  const isFullyPaid = remainingBalance <= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Scoped print styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt-card, #printable-receipt-card * {
            visibility: visible !important;
          }
          #printable-receipt-card {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
            box-shadow: none !important;
            border: 1px solid #1e293b !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-xs text-slate-200 tracking-wide uppercase">
              Receipt Preview &bull; {receiptNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-installment selector tabs (Hidden on print) */}
        {paymentsList.length > 1 && (
          <div className="bg-slate-50 px-6 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-slate-200 no-print">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap mr-1">
              Select Installment:
            </span>
            {paymentsList.map((p, idx) => (
              <button
                key={p._id || idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeIdx === idx
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                #{idx + 1} &bull; ₹{p.amount}{" "}
                {p.receiptNo ? `(${p.receiptNo})` : ""}
              </button>
            ))}
          </div>
        )}

        {/* Printable Receipt Card */}
        <div id="printable-receipt-card" className="p-8 bg-white text-slate-900">
          {/* College Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-slate-900 uppercase">
              SK College of Technology
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Approved by AICTE &bull; Affiliated to State Technical University &bull; Accredited Grade A
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              College Campus, Jaipur, Rajasthan &bull; Phone: +91 98765 43210 &bull; Email: accounts@skcollege.edu
            </p>
            <div className="mt-3.5 inline-block px-3.5 py-1 bg-slate-900 text-white text-[11px] font-bold tracking-widest uppercase rounded-md">
              Official Fee Payment Receipt
            </div>
          </div>

          {/* Receipt Meta & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-semibold text-slate-500">Receipt No: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {receiptNumber}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Date: </span>
              <span className="font-bold text-slate-800">{paymentDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">Status: </span>
              {isFullyPaid ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Partial / Installment
                </span>
              )}
            </div>
          </div>

          {/* Student & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs border border-slate-200 rounded-xl p-4 bg-white">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Student Name:</span>{" "}
                <strong className="text-slate-900 font-bold text-sm">{studentDisplayName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Roll No / ID:</span>{" "}
                <span className="text-slate-800 font-mono font-semibold">{rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Academic Program:</span>{" "}
                <strong className="text-slate-800 font-semibold">{courseDisplayName}</strong>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 font-medium">Payment Mode:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {activePayment.paymentMode || fees?.paymentMode || "Cash"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Transaction Reference:</span>{" "}
                <span className="text-slate-800 font-mono">
                  {activePayment.transactionId || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Installment:</span>{" "}
                <span className="text-slate-800 font-semibold">
                  #{activeIdx + 1} of {paymentsList.length || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="mt-4 border border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-4">Fee Particulars</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-4 text-slate-700">Total Course Tuition Fee</td>
                  <td className="py-2 px-4 text-right font-medium text-slate-900">
                    ₹{totalCourseFee.toLocaleString("en-IN")}
                  </td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Institutional Scholarship / Concession</td>
                    <td className="py-2 px-4 text-right text-emerald-600 font-medium">
                      - ₹{discount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-50/80 font-semibold text-slate-800">
                  <td className="py-2 px-4">Net Payable Course Fee</td>
                  <td className="py-2 px-4 text-right">
                    ₹{netPayable.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="bg-emerald-50/70 text-emerald-950 font-bold border-t-2 border-emerald-500">
                  <td className="py-2.5 px-4 text-xs">
                    Amount Deposited in this Transaction (Installment #{activeIdx + 1})
                  </td>
                  <td className="py-2.5 px-4 text-right text-sm text-emerald-700 font-extrabold">
                    ₹{amountPaidInThisReceipt.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className={`font-bold ${isFullyPaid ? "bg-slate-50 text-slate-700" : "bg-amber-50/70 text-amber-950"}`}>
                  <td className="py-2.5 px-4">Remaining Balance / Due Amount</td>
                  <td className="py-2.5 px-4 text-right text-xs">
                    ₹{remainingBalance.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          {activePayment.remarks && (
            <div className="mt-3.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Remarks: </span>
              {activePayment.remarks}
            </div>
          )}

          {/* Signature & Seal Block */}
          <div className="mt-12 pt-4 flex justify-between items-end text-xs text-slate-600">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700 text-[11px]">Student / Depositor</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-t border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700 text-[11px]">Authorized Cashier / Seal</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Accounts &amp; Finance Wing</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            This is an official computer-generated fee payment receipt issued by SK College of Technology. Valid without physical signature if verified by accounts code.
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="bg-slate-50 px-6 py-3 flex justify-end gap-2.5 border-t border-slate-200 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
