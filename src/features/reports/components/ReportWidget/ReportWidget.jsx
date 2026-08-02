import { Copy, Download, EyeOff, GripVertical, Heart, Maximize2, Minimize2, MoreHorizontal, RefreshCw, Settings, Trash2 } from "lucide-react";

import ChartCard from "../ChartCard/ChartCard";
import "./ReportWidget.scss";

const ReportWidget = ({ widget, data, onAction, onCompare, onExport, onRefresh, onDrill }) => {
  if (!widget.visible) return null;

  return (
    <section className={`report-widget report-widget--${widget.size} ${widget.minimized ? "is-minimized" : ""}`}>
      <div className="report-widget__toolbar">
        <span>
          <GripVertical size={14} />
          {widget.title}
        </span>
        <div>
          <button type="button" aria-label="Move widget" onClick={() => onAction(widget.id, "move")}><GripVertical size={14} /></button>
          <button type="button" aria-label="Resize widget" onClick={() => onAction(widget.id, "resize")}><Maximize2 size={14} /></button>
          <button type="button" aria-label="Minimize widget" onClick={() => onAction(widget.id, "minimize")}><Minimize2 size={14} /></button>
          <button className={widget.favorite ? "is-active" : ""} type="button" aria-label="Favorite widget" onClick={() => onAction(widget.id, "favorite")}><Heart size={14} /></button>
          <details className="report-widget__more">
            <summary aria-label="Widget actions"><MoreHorizontal size={14} /></summary>
            <button type="button" aria-label="Hide widget" onClick={() => onAction(widget.id, "hide")}><EyeOff size={14} />Yashirish</button>
            <button type="button" aria-label="Duplicate widget" onClick={() => onAction(widget.id, "duplicate")}><Copy size={14} />Nusxa</button>
            <button type="button" aria-label="Export widget" onClick={onExport}><Download size={14} />Eksport</button>
            <button type="button" aria-label="Refresh widget" onClick={() => onAction(widget.id, "refresh")}><RefreshCw size={14} />Yangilash</button>
            <button type="button" aria-label="Widget settings" onClick={() => onAction(widget.id, "settings")}><Settings size={14} />Sozlash</button>
            <button type="button" aria-label="Delete widget" onClick={() => {
              if (window.confirm("Widget o'chirilsinmi?")) onAction(widget.id, "delete");
            }}><Trash2 size={14} />O'chirish</button>
          </details>
        </div>
      </div>

      {!widget.minimized && (
        <ChartCard
          title={widget.title}
          type={widget.type}
          data={data}
          onRefresh={onRefresh}
          onCompare={onCompare}
          onExport={onExport}
          onDrill={onDrill}
          onFullscreen={() => onAction(widget.id, "resize")}
        />
      )}
    </section>
  );
};

export default ReportWidget;
