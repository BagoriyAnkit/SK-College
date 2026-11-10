import React from "react";
import { School } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <School size={15} className="text-blue-600" />
          <span>SK College Enterprise Resource Planning</span>
        </div>
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} SK College Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
