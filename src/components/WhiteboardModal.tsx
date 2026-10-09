import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Edit2, Eraser, Download, Check } from 'lucide-react';
import { WhiteboardPoint } from '../types/meet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastDraw: (point: WhiteboardPoint) => void;
  onBroadcastClear: () => void;
  incomingPoints: WhiteboardPoint[];
  incomingClearTimestamp: number;
  isDark: boolean;
}

const COLORS = ['#ffffff', '#0494f4', '#34a853', '#fbbc05', '#ea4335', '#000000'];

export const WhiteboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBroadcastDraw,
  onBroadcastClear,
  incomingPoints,
  incomingClearTimestamp,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#0494f4');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Redraw when incoming remote points arrive
  useEffect(() => {
    if (!canvasRef.current || incomingPoints.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const latest = incomingPoints[incomingPoints.length - 1];
    if (latest.isNewStroke) {
      lastPointRef.current = null;
    }

    ctx.strokeStyle = latest.color;
    ctx.lineWidth = latest.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(latest.x, latest.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(latest.x, latest.y, latest.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x: latest.x, y: latest.y };
  }, [incomingPoints]);

  // Handle remote clear event
  useEffect(() => {
    if (canvasRef.current && incomingClearTimestamp > 0) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [incomingClearTimestamp]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y };

    const color = isEraser ? (isDark ? '#212121' : '#ffffff') : selectedColor;
    const size = isEraser ? 24 : brushSize;

    onBroadcastDraw({ x, y, color, size, isNewStroke: true });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const color = isEraser ? (isDark ? '#212121' : '#ffffff') : selectedColor;
    const size = isEraser ? 24 : brushSize;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPointRef.current = { x, y };
    onBroadcastDraw({ x, y, color, size, isNewStroke: false });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onBroadcastClear();
    }
  };

  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `gothwad-meet-notes-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
          isDark
            ? 'bg-[#212121] text-white border-neutral-700'
            : 'bg-white text-neutral-900 border-neutral-300'
        }`}
      >
        {/* Header with Tools */}
        <div className="h-16 px-5 border-b border-inherit flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0494f4]" />
              <span>Meeting Whiteboard</span>
            </h3>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              (Live synced across all participants)
            </span>
          </div>

          {/* Tools */}
          <div className="flex items-center gap-2">
            {/* Color buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-800 border border-neutral-700">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedColor(c);
                    setIsEraser(false);
                  }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === c && !isEraser ? 'scale-125 ring-2 ring-[#0494f4]' : ''
                  }`}
                  style={{ backgroundColor: c, border: c === '#000000' ? '1px solid #444' : undefined }}
                />
              ))}
            </div>

            {/* Eraser */}
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl transition-colors ${
                isEraser
                  ? 'bg-[#0494f4] text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Clear */}
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-rose-400 transition-colors"
              title="Clear whiteboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={downloadCanvas}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="Save image"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white transition-colors ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative bg-neutral-900/60 overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
