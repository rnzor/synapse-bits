import React from 'react';
import { IconLock } from '../../components/Icons';

interface LockedContentOverlayProps {
  title?: string;
  reason?: string;
  upgradeText?: string;
  onUpgrade?: () => void;
  className?: string;
  variant?: 'card' | 'modal' | 'inline';
}

const LockedContentOverlay: React.FC<LockedContentOverlayProps> = ({
  title = 'Premium Content',
  reason = 'Upgrade to access this content',
  upgradeText = 'Upgrade to PRO',
  onUpgrade,
  className = '',
  variant = 'card'
}) => {
  const baseClasses = 'absolute inset-0 flex items-center justify-center z-10';
  const backdropClasses = 'bg-black/60 backdrop-blur-sm rounded-2xl';

  const variantClasses = {
    card: `${baseClasses} ${backdropClasses}`,
    modal: `${baseClasses} bg-black/80 backdrop-blur-md`,
    inline: `${baseClasses} bg-slate-900/90 backdrop-blur-sm rounded-lg`
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className="text-center p-6 max-w-sm">
        <div className="mb-4">
          <IconLock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-300 text-sm mb-4">{reason}</p>
        </div>

        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            {upgradeText}
          </button>
        )}
      </div>
    </div>
  );
};

export default LockedContentOverlay;