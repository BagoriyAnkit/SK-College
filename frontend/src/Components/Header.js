import React from "react";
import ProfileDropdown from "./ProfileDropdown";
import { Menu, ExternalLink, School } from "lucide-react";
import logo from "../assets/SKcollege logo.png";

export default function Header({ onMenuClick = () => {} }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left Side: Mobile Menu Button & System Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-slate-300"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="SK College"
                className="w-9 h-9 object-contain rounded-md hidden sm:block"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    SK College Management
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    ERP Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Academic Session 2026-2027 &bull; Administrative Operations
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Action & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
            >
              <School size={14} className="text-slate-500" />
              <span>Public Website</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
