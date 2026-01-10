import React from 'react';
import { Bit } from '../../types';

interface DevDebugOverlayProps {
  bits?: Bit[];
  label: string;
}

const DevDebugOverlay: React.FC<DevDebugOverlayProps> = ({ bits, label }) => {

  const pathname = window.location.pathname;
  const bitCount = bits?.length || 0;
  const firstThreeTitles = bits?.slice(0, 3).map(b => b.title) || [];

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg font-mono text-xs max-w-xs">
      <div className="text-amber-400 font-bold mb-1">🔧 DEV DEBUG</div>
      <div><strong>Page:</strong> {label}</div>
      <div><strong>Route:</strong> {pathname}</div>
      <div><strong>Bits:</strong> {bitCount}</div>
      {firstThreeTitles.length > 0 && (
        <div>
          <div className="mt-1"><strong>Sample:</strong></div>
          {firstThreeTitles.map((title, i) => (
            <div key={i} className="truncate">• {title}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevDebugOverlay;