import { useState, useRef, useCallback } from "react";
import { ScanLine, RefreshCw, ArrowLeft, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropzone from "@/components/Dropzone";
import VisualDiffViewer from "@/components/VisualDiffViewer";
import DataTables from "@/components/DataTables";
import StepIndicator from "@/components/StepIndicator";
import ProfileDropdown from "@/components/ProfileDropdown";

const Index = () => {
  const [baseFile, setBaseFile] = useState<File | null>(null);
  const [childFile, setChildFile] = useState<File | null>(null);
  const [analysisRun, setAnalysisRun] = useState(true); // true to show demo data

  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-primary text-white px-6 py-0 flex items-center justify-between shadow-md sticky top-0 z-40" style={{ minHeight: 52 }}>
        <div className="flex items-center gap-4 h-[52px]">
          <Link to={formData ? "/form-summary?flow=to-compare" : "/"} state={formData ? { formData } : undefined} className="flex items-center gap-1 border-r border-white/20 pr-4 h-full text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <ScanLine size={18} />
            <span className="text-sm font-bold tracking-tight uppercase">LabelX Proofreading</span>
            <span className="text-white/30 mx-1">|</span>
            <span className="text-xs text-white/70 font-medium">Comparison Analysis</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <StepIndicator current={formData ? 3 : 1} />
          </div>
          <ProfileDropdown />
        </div>
      </nav>

      {/* Secondary Metadata Navbar (Only if formData is present) */}
      {formData && (
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs sticky top-[52px] z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[11px]">CR</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata?.cr_number || "CR-2025-0042"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[11px]">SKU</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata?.part_number || "08714729-MX"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[11px]">REV</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata?.label_version || "Rev B → Rev C"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[11px]">Requested By</span>
            <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata?.requested_by || "Athmika"}</span>
          </div>
        </div>
      )}

      <main className="flex w-full flex-1 min-h-0 bg-slate-50 flex-col overflow-y-auto">
        {/* Upload Section (if no files passed and not submitted) */}
        {!analysisRun && (
          <section className="p-8 max-w-5xl mx-auto w-full mt-6 bg-white border border-gray-200 shadow-sm rounded-sm">
            <div className="grid grid-cols-2 gap-6">
              <Dropzone label="Upload Current Version Label (PDF / Image)" file={baseFile} onFileSelect={setBaseFile} />
              <Dropzone label="Upload New Version Label" file={childFile} onFileSelect={setChildFile} />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setAnalysisRun(true)}
                disabled={!baseFile || !childFile}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 text-[14px] font-bold uppercase tracking-widest transition-all ${
                  (baseFile && childFile) ? "bg-primary text-white hover:opacity-90 shadow-sm" : "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed border border-[#e2e8f0]"
                }`}
              >
                {formData ? "RUN PROOFING ANALYSIS" : "RUN COMPARATOR ANALYSIS"}
              </button>
            </div>
          </section>
        )}

        {analysisRun && (
          <>
            {/* Visual Diff */}
            <section className="bg-white border-b border-gray-200">
              <VisualDiffViewer />
            </section>

            {/* Data Tables */}
            <section className="p-8">
              <DataTables formData={formData} />
            </section>
          </>
        )}
      </main>
      {/* Global Action Footer */}
      {analysisRun && (
        <div className="bg-white border-t border-gray-200 px-8 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
          <div className="font-mono text-xs text-slate-400 font-medium tracking-wide flex items-center gap-4">
            <span>Generated: {new Date().toISOString().split("T")[0]}</span>
            <span>Ref: {formData?.metadata?.cr_number || "CR-2025-0042"}</span>
          </div>
          <button
            onClick={() => navigate('/report', { state: { scenario: formData ? 'C' : 'A', formData } })}
            className="flex items-center gap-2 bg-[#d51900] text-white px-6 py-2.5 text-[13px] font-bold uppercase tracking-widest hover:bg-[#b01300] transition-colors rounded shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
