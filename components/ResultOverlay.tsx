import React from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';
import { GeneratedResult } from '../types';

interface ResultOverlayProps {
  result: GeneratedResult | null;
  onClose: () => void;
  isLoading: boolean;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ result, onClose, isLoading }) => {
  if (!isLoading && !result) return null;

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = 'kemetic-mirror-artifact.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-4xl w-full bg-stone-900 border border-amber-700/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-amber-900/50 rounded-full text-stone-300 hover:text-amber-400 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full h-96 md:h-[600px] flex flex-col items-center justify-center space-y-6 p-12 text-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-stone-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-heading text-amber-500 mb-2">Transmuting Form</h3>
              <p className="text-stone-400 italic">Consulting the weavers of fate...</p>
            </div>
          </div>
        )}

        {/* Result State */}
        {!isLoading && result && (
          <>
            {/* Image Section */}
            <div className="w-full md:w-3/5 bg-black relative h-[50vh] md:h-auto">
              <img 
                src={result.imageUrl} 
                alt="Transformed Self" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent md:hidden"></div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-2/5 p-8 flex flex-col justify-between bg-stone-950 text-stone-100 border-t md:border-t-0 md:border-l border-amber-900/30">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-bold">The Oracle Speaks</span>
                  <h2 className="text-3xl font-heading text-white leading-tight">Your Ancient Form Revealed</h2>
                </div>
                
                <div className="relative p-6 bg-stone-900/50 rounded-lg border border-amber-900/20">
                  <p className="font-serif text-lg leading-relaxed text-stone-300 italic">
                    "{result.oracleText}"
                  </p>
                  <div className="absolute -top-3 left-4 bg-stone-950 px-2 text-amber-600 text-4xl leading-none font-heading">"</div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition-all"
                >
                  <Download size={18} />
                  <span>Save Artifact</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-lg transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
