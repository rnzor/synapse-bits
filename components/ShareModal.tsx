
import React, { useState, useRef } from 'react';
import { Bit } from '../types';
import { IconX, IconTwitter, IconFacebook, IconLinkedin, IconLink, IconCheck, IconShare, IconDownload, IconCopy } from './Icons';
import html2canvas from 'html2canvas';
import { slugify } from '../utils';

interface ShareModalProps {
  bit: Bit;
  onClose: () => void;
}

// Separate Card component ensuring parity between preview and export
const BitCard: React.FC<{ bit: Bit; isExport?: boolean }> = ({ bit, isExport }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const diffColor = getDifficultyColor(bit.difficulty);

  return (
    <div
      data-export-root={isExport ? "true" : "false"}
      style={{
        width: '400px',
        minHeight: '480px',
        background: 'linear-gradient(165deg, #030712 0%, #0f172a 100%)',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        // Critical: no transforms here
        transform: 'none',
        contain: 'layout paint style'
      }}
    >
      {/* Background Gradients */}
      <div className="blur-effect" style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%' }}></div>
      <div className="blur-effect" style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '180px', height: '180px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%' }}></div>

      {/* Header: Logo Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)',
          }}>
            <span style={{ fontSize: '20px', lineHeight: 1, color: '#fff', display: 'block' }}>⚡</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '900', color: 'white', fontSize: '14px', letterSpacing: '0.06em', lineHeight: 1 }}>SYNAPSE BITS</span>
            <span style={{ fontSize: '9px', color: '#6366f1', fontWeight: 'bold', fontFamily: 'Consolas, monospace', letterSpacing: '0.05em', lineHeight: 1, marginTop: '3px' }}>NEURAL·STREAM·ACTIVE</span>
          </div>
        </div>

        {/* Difficulty Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24px',
          padding: '0 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
        }}>
          <span style={{
            color: diffColor,
            fontSize: '10px',
            fontFamily: 'Consolas, monospace',
            textTransform: 'uppercase',
            fontWeight: '900',
            letterSpacing: '0.08em',
            lineHeight: 1,
            display: 'block'
          }}>
            {bit.difficulty}
          </span>
        </div>
      </div>

      {/* Body Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '10px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {bit.title}
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6, opacity: 0.9 }}>
          {bit.summary}
        </p>

        {/* Code Block Container */}
        {bit.codeSnippet && (
          <div style={{
            background: 'rgba(13, 17, 23, 0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '16px',
            marginBottom: '20px',
          }}>
            <div style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '11px',
              color: '#e2e8f0',
              lineHeight: 1.7
            }}>
              {bit.codeSnippet.split('\n').slice(0, 7).map((line, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ minWidth: '22px', color: '#4b5563', marginRight: '14px', textAlign: 'right', userSelect: 'none' }}>{i + 1}</span>
                  <span style={{ color: '#cbd5e1' }}>{line || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags Row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {bit.tags.slice(0, 3).map(tag => (
            <div key={tag} style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '24px',
              padding: '0 12px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '6px',
            }}>
              <span style={{
                fontSize: '11px',
                color: '#a5b4fc',
                fontWeight: '600',
                fontFamily: 'Consolas, monospace',
                lineHeight: 1,
                display: 'block'
              }}>#{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Row */}
      <div style={{
        marginTop: '28px',
        paddingTop: '18px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', display: 'block' }}>⚡</span>
          <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '900', lineHeight: 1 }}>{bit.votes}</span>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>neural votes</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span className="domain-dot" style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'block', flex: '0 0 6px', boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}></span>
          <span style={{
            fontSize: '11px',
            color: '#4b5563',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            lineHeight: 1
          }}>
            bits.rnzlive.com
          </span>
        </div>
      </div>
    </div>
  );
};

const ShareModal: React.FC<ShareModalProps> = ({ bit, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/bit/${slugify(bit.title)}`;
  const shareText = `Check out this bit: ${bit.title}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const generateImage = async (): Promise<Blob | null> => {
    if (!exportCardRef.current) return null;
    setIsGenerating(true);

    try {
      // 1. Wait for fonts (Gold Standard)
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }

      // 2. Wait for layout settle
      await new Promise(resolve => requestAnimationFrame(resolve));

      // 3. Capture with deterministic options
      const EXPORT_W = 400;
      const EXPORT_H = 480;

      const canvas = await html2canvas(exportCardRef.current, {
        backgroundColor: '#030712', // Force solid background to prevent blank captures
        useCORS: true,
        allowTaint: false,
        logging: true, // Enable for debugging if needed

        // Make output deterministic
        scale: 2,
        width: EXPORT_W,
        height: EXPORT_H,
        windowWidth: EXPORT_W,
        windowHeight: EXPORT_H,
        scrollX: 0,
        scrollY: 0,

        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // 1) Lock the stage wrapper
          const stage = clonedDoc.querySelector('[data-export-stage="true"]') as HTMLElement | null;
          if (stage) {
            stage.style.width = `${EXPORT_W}px`;
            stage.style.height = `${EXPORT_H}px`;
            stage.style.overflow = 'hidden';
            stage.style.position = 'fixed';
            stage.style.left = '0';
            stage.style.top = '0';
            stage.style.transform = 'none';
            (stage.style as any).zoom = '1';
            stage.style.opacity = '1';
            stage.style.visibility = 'visible';
            stage.style.display = 'block';
            stage.style.background = 'transparent';
          }

          // 2) Lock the actual card root
          const card = clonedDoc.querySelector('[data-export-root="true"]') as HTMLElement | null;
          if (card) {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.transform = 'none';
            (card.style as any).zoom = '1';
            card.style.width = `${EXPORT_W}px`;
            card.style.height = `${EXPORT_H}px`;

            // Kill animations/transitions (prevents 1-frame drift)
            card.querySelectorAll<HTMLElement>('*').forEach((el) => {
              el.style.transition = 'none';
              el.style.animation = 'none';
            });

            // Help rendering: temporarily disable blur effects which can cause blank captures
            card.querySelectorAll<HTMLElement>('.blur-effect').forEach((el) => {
              el.style.display = 'none';
            });
          }
        },
      });


      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          setIsGenerating(false);
          resolve(blob);
        }, 'image/png');
      });
    } catch (e) {
      console.error("Image generation failed", e);
      setIsGenerating(false);
      return null;
    }
  };

  const handleNativeShare = async () => {
    const blob = await generateImage();
    if (blob && navigator.share) {
      const file = new File([blob], 'synapse-bit-card.png', { type: 'image/png' });
      try {
        await navigator.share({
          title: bit.title,
          text: bit.summary,
          files: [file]
        });
      } catch (e) {
        console.debug("Share cancelled or failed", e);
      }
    } else {
      alert("Sharing not supported on this device. Try saving instead.");
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `synapse-bit-${bit.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyImage = async () => {
    const blob = await generateImage();
    if (blob) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } catch (err) {
        console.error('Failed to copy image to clipboard:', err);
        alert('Could not copy to clipboard. The image will be downloaded instead.');
        handleDownload();
      }
    }
  };

  const socialLinks = [
    {
      name: 'X',
      icon: <IconTwitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-black hover:text-white border-slate-700'
    },
    {
      name: 'FB',
      icon: <IconFacebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600 hover:text-white border-slate-700'
    },
    {
      name: 'LinkedIn',
      icon: <IconLinkedin className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-700 hover:text-white border-slate-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      {/* Hidden Export Stage (Offscreen) */}
      <div
        ref={exportCardRef}
        data-export-stage="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          pointerEvents: 'none',
          width: 400,
          height: 480,
          overflow: 'hidden',
          zIndex: -1
        }}
      >
        <BitCard bit={bit} isExport={true} />
      </div>

      <div className="relative w-full max-w-lg glass-modal rounded-3xl border border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <IconShare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Share Neural Bit</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview Area */}
        <div className="flex-1 overflow-y-auto mb-8 flex justify-center bg-black/40 rounded-2xl p-6 border border-white/5 scrollbar-hide">
          <BitCard bit={bit} />
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleCopyImage}
            disabled={isGenerating}
            className={`flex flex-col items-center justify-center space-y-1 py-3 rounded-2xl font-bold transition-all border disabled:opacity-50 ${copiedImage
              ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/50'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-indigo-500/50'
              }`}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : copiedImage ? (
              <IconCheck className="w-5 h-5" />
            ) : (
              <IconCopy className="w-5 h-5" />
            )}
            <span className="text-[10px] uppercase tracking-widest">{copiedImage ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isGenerating}
            className="flex flex-col items-center justify-center space-y-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/10 disabled:opacity-50"
          >
            <IconShare className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest">Share</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex flex-col items-center justify-center space-y-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-white/10 disabled:opacity-50"
          >
            <IconDownload className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest">Save</span>
          </button>
        </div>

        {/* Link Actions */}
        <div className="flex items-center space-x-3 pt-6 border-t border-white/5">
          <div className="flex-1 flex items-center space-x-2 px-3 py-2 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-400 font-mono truncate overflow-hidden">
            <IconLink className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">bits.rnzlive.com/...</span>
          </div>

          <button
            onClick={handleCopy}
            className={`p-2.5 rounded-xl border transition-all ${copied ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
          >
            {copied ? <IconCheck className="w-5 h-5" /> : <IconLink className="w-5 h-5" />}
          </button>

          <div className="flex space-x-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2.5 rounded-xl border bg-slate-800 border-white/10 text-slate-400 transition-all ${social.color}`}
                title={`Share on ${social.name}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;
