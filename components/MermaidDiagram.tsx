import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { IconZoomIn, IconZoomOut, IconRefresh } from './Icons';

interface MermaidDiagramProps {
  definition: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ definition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background: '#0d1117',
        primaryColor: '#6366f1',
        primaryTextColor: '#fff',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
      },
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono',
    });
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!definition) return;
      setError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const { svg } = await mermaid.render(id, definition);
        setSvgContent(svg);
      } catch (e) {
        console.error("Mermaid Render Failed", e);
        setError(true);
      }
    };

    render();
  }, [definition]);

  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey) {
           e.preventDefault();
           const delta = e.deltaY > 0 ? 0.9 : 1.1;
           setScale(s => Math.min(Math.max(0.5, s * delta), 5));
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          setPosition({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y
          });
      }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const zoomIn = () => setScale(s => Math.min(5, s * 1.2));
  const zoomOut = () => setScale(s => Math.max(0.5, s / 1.2));
  const reset = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  if (error) {
    return (
        <div className="p-4 text-center text-rose-400 text-sm border border-rose-500/20 rounded-lg bg-rose-500/5">
            Could not visualize this concept automatically.
        </div>
    );
  }

  return (
    <div className="relative group rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden h-[400px]">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-slate-800/80 backdrop-blur rounded-lg p-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={zoomIn} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Zoom In">
                <IconZoomIn className="w-4 h-4" />
            </button>
            <button onClick={zoomOut} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Zoom Out">
                <IconZoomOut className="w-4 h-4" />
            </button>
             <button onClick={reset} className="p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white" title="Reset View">
                <IconRefresh className="w-4 h-4" />
            </button>
        </div>

        {/* Canvas */}
        <div 
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ touchAction: 'none' }}
        >
            <div 
                className="transition-transform duration-75 ease-out origin-center"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
        
        {/* Hint */}
        <div className="absolute bottom-4 left-4 text-[10px] text-slate-600 pointer-events-none">
            Drag to pan • Scroll/Btn to zoom
        </div>
    </div>
  );
};

export default MermaidDiagram;