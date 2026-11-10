import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  CreditCard,
  GraduationCap,
  Calendar,
  User,
  Printer,
  CheckCircle2,
  AlertCircle,
  Edit2,
  History,
  ArrowRight
} from "lucide-react";
import ReceiptModal from "./ReceiptModal";

export default function FeesDetails({ open, onClose, fees }) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);

  if (!open || !fees) return null;

  const displayName =
    fees.studentName ||
    fees.StudentName ||
    fees.studentId?.StudentName ||
    fees.studentId?.studentName ||
    "Applicant / Student";

  const rollNumber =
    fees.studentId?.RollNumber ||
    fees.studentId?.rollNumber ||
    "N/A";

  const totalCourseFee = Number(fees.totalFees || 0);
  const discount = Number(fees.discount || 0);
  const netPayable = Math.max(0, totalCourseFee - discount);
  const totalPaid = Number(fees.paidAmount || 0);
  const dueBalance = Number(fees.dueAmount !== undefined ? fees.dueAmount : Math.max(0, netPayable - totalPaid));
  const isFullyPaid = dueBalance <= 0;

  const payments = Array.isArray(fees.payments) ? fees.payments : [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Student Fee Account Ledger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Identity Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{displayName}</h2>
              <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fees.courseName || "General Course"}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-slate-700">Roll: {rollNumber}</span>
              </div>
            </div>

            {/* Status Pill */}
            {isFullyPaid ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cleared &bull; Paid</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Partial Due</span>
              </span>
            )}
          </div>

          {/* Financial Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Total Fees</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                ₹{totalCourseFee.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Discount</span>
              <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                {discount > 0 ? `-₹${discount.toLocaleString("en-IN")}` : "₹0"}
              </span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-[11px] text-emerald-700 block font-medium">Total Paid</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                ₹{totalPaid.toLocaleString("en-IN")}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${dueBalance > 0 ? "bg-amber-50/60 border-amber-100" : "bg-slate-50/80 border-slate-100"}`}>
              <span className={`text-[11px] block font-medium ${dueBalance > 0 ? "text-amber-700" : "text-slate-400"}`}>
                Outstanding Due
              </span>
              <span className={`text-sm font-bold mt-0.5 block ${dueBalance > 0 ? "text-amber-800" : "text-slate-800"}`}>
                ₹{dueBalance.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Payment History / Installments Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-600" />
                <span>Installment Ledger ({payments.length > 0 ? payments.length : 1} Records)</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentIndex(0);
                  setReceiptOpen(true);
                }}
                className="text-xs font-semibold text-slate-900 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3" />
                <span>Latest Receipt</span>
              </button>
            </div>

            {payments.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {payments.map((p, idx) => (
                  <div
                    key={p._id || idx}
                    className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Installment #{idx + 1}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {p.paymentMode || "Cash"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString("en-GB")
                            : "N/A"}
                        </span>
                        {p.receiptNo && (
                          <>
                            <span>&bull;</span>
                            <span className="font-mono text-slate-500">{p.receiptNo}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPaymentIndex(idx);
                          setReceiptOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                        title="View Receipt"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Initial Fee Payment</span>
                  <span className="text-[11px] text-slate-400">
                    Recorded on {fees.paymentDate ? new Date(fees.paymentDate).toLocaleDateString("en-GB") : "Admission"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{totalPaid.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentIndex(0);
                      setReceiptOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <Link
            to={`/admin/fees/edit/${fees._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Fee Record</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Printable Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        fees={fees}
        paymentIndex={selectedPaymentIndex}
      />
    </div>
  );
}
