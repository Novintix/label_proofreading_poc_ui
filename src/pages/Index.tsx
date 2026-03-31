import { useState, useEffect } from "react";
import { Download, RefreshCw, FileText, Activity, AlertCircle, Play, ScanLine, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropzone from "@/components/Dropzone";
import VisualDiffViewer from "@/components/VisualDiffViewer";
import DataTables from "@/components/DataTables";
import ProfileDropdown from "@/components/ProfileDropdown";
import StepIndicator from "@/components/StepIndicator";
import { toast } from "sonner";
import { discrepancies } from "@/data/dummyData";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  const [baseFile, setBaseFile] = useState<File[]>(location.state?.baseFile || []);
  const [childFiles, setChildFiles] = useState<File[]>(location.state?.childFile || []);
  const [analysisRun, setAnalysisRun] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-run analysis for Scenario 3
  useEffect(() => {
    if (formData && baseFile.length > 0 && childFiles.length > 0 && !analysisRun && !loading) {
      handleRunAnalysis();
    }
  }, [formData, baseFile, childFiles, analysisRun, loading]);

  const [progress, setProgress] = useState(0);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const handleRunAnalysis = async () => {
    if (baseFile.length === 0 || childFiles.length === 0) {
      toast.error("Please upload both base and child labels.");
      return;
    }

    if (!formData) setLoading(true);
    setProgress(0);
    setAnalysisRun(false);

    // For Scenario 3, pre-populate mock results immediately so components are shown
    if (formData) {
      setApiResults([{
        filename: "Analysis Result 1",
        annotated_base_image: undefined,
        annotated_child_image: undefined,
        parsedItems: discrepancies
      }]);
      setAnalysisRun(true);
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(progressInterval); return 95; }
        return prev + 5;
      });
    }, 400);

    const data = new FormData();
    data.append("base_file", baseFile[0]);
    childFiles.forEach(file => data.append("child_files", file));

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/compare`, { method: "POST", body: data });

      if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`);

      const rawData = await response.json();

      const processedResults = rawData.results.map((result: any, index: number) => {
        const apiDiscrepancies = result.discrepancies || {};
        const parsedItems: any[] = [];
        let idCounter = 1;

        for (const status of ["Added", "Deleted", "Modified", "Repositioned"]) {
          if (apiDiscrepancies[status]) {
            apiDiscrepancies[status].forEach((item: any) => {
              let oldText, newText;
              let value = item.Value;
              if (status === "Modified" && typeof value === "string") {
                const match = value.match(/From:\s*'(.*?)'\s*➔\s*To:\s*'(.*?)'/);
                if (match) { oldText = match[1]; newText = match[2]; }
              }
              parsedItems.push({ id: `api-d${index}-${idCounter++}`, category: item.Category, status, value, oldText, newText });
            });
          }
        }

        return { ...result, parsedItems };
      });

      setApiResults(processedResults);
      setSelectedResultIndex(0);
      setProgress(100);
      setAnalysisRun(true);
    } catch (error) {
      console.error("Comparison error:", error);
      // For Scenario 3, we already have mock results, so just fail silently or log
      if (!formData) {
        toast.error("Error running analysis. Check console for details.");
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">

      {/* Loading Overlay (Hidden for Scenario 3 to show UI immediately) */}
      {loading && !formData && (
        <div className="fixed inset-0 bg-white/85 backdrop-blur-[3px] z-[100] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <Activity className="h-12 w-12 text-[#d51900] animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="font-bold text-slate-800 tracking-tight">
                {formData ? "PROOFING ANALYSIS" : "COMPARATOR ANALYSIS"}
              </span>
              <div className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                Analyzing Label Components... {progress}%
              </div>
              <div className="text-sm text-slate-500">Executing SIFT Alignment &amp; YOLO Detection</div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-[#d51900] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] font-bold text-[#d51900] uppercase tracking-[0.2em] animate-pulse">
              Running Comparator Logic
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-primary text-white px-6 py-0 flex items-center justify-between shadow-md sticky top-0 z-40" style={{ minHeight: 52 }}>
        <div className="flex items-center gap-4 h-[52px]">
          <Link
            to={formData ? "/form-summary?flow=to-compare" : "/"}
            state={formData ? { formData } : undefined}
            className="flex items-center gap-1 border-r border-white/20 pr-4 h-full text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <ScanLine size={18} />
            <span className="text-sm font-bold tracking-tight uppercase">LabelX Proofreading</span>
            <span className="text-white/30 mx-1">|</span>
            <span className="text-xs text-white/70 font-medium">{formData ? "Proofing Analysis" : "Comparison Analysis"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {formData && (
            <div className="hidden md:block">
              <StepIndicator current={3} />
            </div>
          )}
          <ProfileDropdown />
        </div>
      </nav>

      {/* Secondary Metadata Bar (only when navigated via form) */}
      {formData && (
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs sticky top-[52px] z-30 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[10px]">CR Number</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata.cr_number || "CR-2025-0042"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[10px]">SKU</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata.part_number || "08714729-MX"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[10px]">Revision</span>
              <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata.label_version || "REV-D"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] font-bold tracking-widest uppercase text-[11px]">Requested By</span>
            <span className="text-[#334155] font-semibold text-[13px]">{formData.metadata.requested_by || "Athmika"}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">

        {/* Result Tabs — only when multiple child results */}
        {analysisRun && apiResults.length > 1 && (
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2 overflow-x-auto">
            {apiResults.map((res, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedResultIndex(idx)}
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border shrink-0 ${selectedResultIndex === idx
                  ? "bg-[#d51900] text-white border-[#d51900] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                  }`}
              >
                {res.filename || `Label ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-6 space-y-6 pb-16 max-w-[1600px] mx-auto w-full">

          {/* ── Upload Section (Hidden in Scenario 3) ── */}
          {!formData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Dropzone
                  label="UPLOAD CURRENT VERSION LABEL (PDF / IMAGE)"
                  files={baseFile}
                  onFilesSelect={setBaseFile}
                  multiple={false}
                  alwaysShowUploadBox={true}
                />
                <Dropzone
                  label="UPLOAD NEW VERSION LABEL"
                  files={childFiles}
                  onFilesSelect={setChildFiles}
                  multiple={true}
                  alwaysShowUploadBox={true}
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-white font-bold rounded shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 tracking-wide text-sm"
                >
                  {loading ? "ANALYZING..." : "RUN COMPARATOR ANALYSIS"}
                </button>
              </div>
            </div>
          )}

          {/* ── Visual Diff Viewer ── */}
          <VisualDiffViewer
            baseImage={analysisRun && apiResults.length > 0 ? apiResults[selectedResultIndex].annotated_base_image : undefined}
            childImage={analysisRun && apiResults.length > 0 ? apiResults[selectedResultIndex].annotated_child_image : undefined}
          />

          {/* ── Inspection Summary + Details ── */}
          <DataTables
            formData={formData}
            discrepancies={analysisRun && apiResults.length > 0 ? apiResults[selectedResultIndex].parsedItems : undefined}
          />

        </div>
      </main>

      {/* Footer action bar — sticky */}
      <div className="sticky bottom-0 bg-white border-t border-[#e2e8f0] px-8 py-2.5 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="font-mono text-xs text-slate-400 font-medium tracking-wide flex items-center gap-4">
          <span>Generated: {new Date().toISOString().split("T")[0]}</span>
          {formData && (
            <span>Ref: {formData?.metadata?.cr_number || "CR-2025-0042"}</span>
          )}
        </div>
        <button
          onClick={() => navigate('/report', { state: { scenario: formData ? 'C' : 'A', formData } })}
          className="flex items-center gap-2 bg-[#d51900] text-white px-8 py-3 text-[13px] font-bold uppercase tracking-widest hover:bg-[#b01300] transition-colors rounded-lg shadow-md"
        >
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default Index;
