import { useRef, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const PLACEHOLDER_LABEL_BASE = "/LCN-187301111_1_Rev-D.png";
export const PLACEHOLDER_LABEL_CHILD = "/LCN-187301111_1_Rev-E.png";

const VisualDiffViewer = ({ baseImage, childImage }: { baseImage?: string; childImage?: string }) => {
  const baseRef = useRef<any>(null);
  const childRef = useRef<any>(null);

  const handleZoomIn = useCallback(() => {
    baseRef.current?.zoomIn();
    childRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    baseRef.current?.zoomOut();
    childRef.current?.zoomOut();
  }, []);

  const handleReset = useCallback(() => {
    baseRef.current?.resetTransform();
    childRef.current?.resetTransform();
  }, []);

  return (
    <div className="border border-border bg-white">

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border-b border-border px-4 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visual Diff Viewer
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={handleReset} className="p-1.5 hover:bg-secondary transition-colors border border-border" title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Column header labels row */}
      <div className="grid grid-cols-2 border-b border-border bg-white">
        <div className="px-4 py-1.5 border-r border-border">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Current Version Label</span>
        </div>
        <div className="px-4 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">New Version Label</span>
        </div>
      </div>

      {/* Image panels row — p-4 on both so images have equal padding from all edges */}
      <div className="grid grid-cols-2">
        <div className="border-r border-border bg-[#f1f5f9] h-[480px] overflow-hidden p-4">
          <TransformWrapper ref={baseRef} minScale={0.5} maxScale={4} initialScale={1}>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <img
                src={baseImage ? `data:image/png;base64,${baseImage}` : PLACEHOLDER_LABEL_BASE}
                alt="Current version label"
                className="max-w-full max-h-full object-contain"
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
        <div className="bg-[#f1f5f9] h-[480px] overflow-hidden p-4">
          <TransformWrapper ref={childRef} minScale={0.5} maxScale={4} initialScale={1}>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <img
                src={childImage ? `data:image/png;base64,${childImage}` : PLACEHOLDER_LABEL_CHILD}
                alt="New version label"
                className="max-w-full max-h-full object-contain"
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 border-t border-border bg-white px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mr-1">Legend:</span>
        <LegendItem color="bg-status-added" label="Added" />
        <LegendItem color="bg-status-deleted" label="Deleted" />
        <LegendItem color="bg-status-modified" label="Modified" />
        <LegendItem color="bg-status-misplaced" label="Repositioned" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3 h-3 ${color}`} />
    <span className="text-xs font-medium text-foreground">{label}</span>
  </div>
);

export default VisualDiffViewer;
