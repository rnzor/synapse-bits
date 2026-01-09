
import React, { useState, useRef } from 'react';
import { Bit } from '../types';
import { IconX, IconTwitter, IconFacebook, IconLinkedin, IconLink, IconCheck, IconShare, IconDownload, IconNetwork, IconCode } from './Icons';
import html2canvas from 'html2canvas';
import SimpleSyntaxHighlighter from './SimpleSyntaxHighlighter';
import { slugify } from '../utils';

interface ShareModalProps {
  bit: Bit;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ bit, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
    if (!cardRef.current) return null;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#030712', 
        logging: false,
        useCORS: true
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
        alert("Sharing not supported on this device. Try downloading instead.");
    }
  };

  const handleDownload = async () => {
      const blob = await generateImage();
      if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `synapse-bits-${bit.id}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg glass-modal rounded-2xl border border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Share Bit Card</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview Area (Scrollable if needed on small screens) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden mb-6 flex justify-center bg-black/30 rounded-xl p-4 border border-white/5">
            {/* The element to capture */}
            <div 
                ref={cardRef} 
                className="relative w-[340px] md:w-[400px] bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col overflow-hidden"
                style={{ aspectRatio: '4/5' }}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                
                {/* Header */}
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="font-mono font-bold text-sm text-white">SB</span>
                        </div>
                        <span className="font-bold text-white tracking-tight">SYNAPSE<span className="text-indigo-400">::</span>BITS</span>
                    </div>
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono uppercase">
                        {bit.difficulty}
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                         {bit.language === 'network' ? <IconNetwork className="w-4 h-4"/> : <IconCode className="w-4 h-4"/>}
                         <span className="text-xs font-mono uppercase">{bit.language}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                        {bit.title}
                    </h2>
                    
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {bit.summary}
                    </p>

                    {bit.codeSnippet && (
                        <div className="mt-auto mb-6 bg-[#0d1117] rounded-lg border border-white/10 p-3 overflow-hidden relative">
                             <SimpleSyntaxHighlighter 
                                code={bit.codeSnippet.split('\n').slice(0, 6).join('\n') + (bit.codeSnippet.split('\n').length > 6 ? '...' : '')} 
                                language={bit.language} 
                                className="text-[10px]" 
                             />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Scan to learn</span>
                    <span>synapse-bits.dev</span>
                </div>
            </div>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
                onClick={handleNativeShare}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
                {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <IconShare className="w-4 h-4" />
                )}
                <span>Share Card</span>
            </button>
            <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all border border-white/10 disabled:opacity-50"
            >
                <IconDownload className="w-4 h-4" />
                <span>Download</span>
            </button>
        </div>

        {/* Secondary Actions (Link & Social) */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex space-x-2">
                {socialLinks.map((social) => (
                    <a 
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg border bg-slate-900/50 text-slate-400 transition-all ${social.color}`}
                        title={`Share on ${social.name}`}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
            
            <button 
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border bg-slate-900/50 text-slate-400 transition-all hover:text-white ${copied ? 'border-emerald-500 text-emerald-400' : 'border-slate-700'}`}
            >
                {copied ? <IconCheck className="w-4 h-4" /> : <IconLink className="w-4 h-4" />}
                <span className="text-xs font-medium">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ShareModal;
