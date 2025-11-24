import React, { useState } from 'react';
import { CameraStage } from './components/CameraStage';
import { ResultOverlay } from './components/ResultOverlay';
import { ARCHETYPES, ACCESSORIES } from './constants';
import { Archetype, Accessory, GeneratedResult, ProcessingState } from './types';
import { transmuteImage, consultOracle } from './services/geminiService';
import { Sparkles, Info, Scroll } from 'lucide-react';

const App: React.FC = () => {
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>(ARCHETYPES[0]);
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('IDLE');
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showArchetypes, setShowArchetypes] = useState(true); // Toggle between Archetypes and Accessories

  const handleCapture = async (base64Image: string) => {
    setProcessingState('TRANSMUTING');
    setResult(null);
    
    try {
      // 1. Generate the Image
      const transmutedImage = await transmuteImage(base64Image, selectedArchetype.promptModifier);
      
      setProcessingState('CONSULTING');
      
      // 2. Generate the Oracle Text
      const oracleText = await consultOracle(selectedArchetype.name);
      
      setResult({
        imageUrl: transmutedImage,
        oracleText: oracleText
      });
      
      setProcessingState('COMPLETE');
    } catch (error) {
      console.error(error);
      setProcessingState('ERROR');
      alert("The spell fizzled. Please try again.");
      setProcessingState('IDLE');
    }
  };

  const closeOverlay = () => {
    setProcessingState('IDLE');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar / Control Panel */}
      <aside className="w-full md:w-96 bg-black border-b md:border-b-0 md:border-r border-stone-800 flex flex-col z-30 h-1/3 md:h-auto relative">
        <div className="p-6 border-b border-stone-800 bg-stone-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-700 rounded-full flex items-center justify-center text-black font-bold text-lg">
              𓂀
            </div>
            <h1 className="text-2xl font-heading text-amber-500 tracking-wider">Kemetic Mirror</h1>
          </div>
          <p className="text-xs text-stone-500 uppercase tracking-widest pl-11">Augmented Reality Loom</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800">
           <button 
             onClick={() => setShowArchetypes(true)}
             className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${showArchetypes ? 'text-amber-500 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
           >
             Generative Archetypes
           </button>
           <button 
             onClick={() => setShowArchetypes(false)}
             className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${!showArchetypes ? 'text-amber-500 bg-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
           >
             Live AR Artifacts
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-950">
          
          {showArchetypes ? (
            <>
              <h2 className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-2 px-2">Select Target Form</h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                {ARCHETYPES.map((archetype) => (
                  <button
                    key={archetype.id}
                    onClick={() => setSelectedArchetype(archetype)}
                    className={`
                      relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border
                      ${selectedArchetype.id === archetype.id 
                        ? 'bg-stone-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                        : 'bg-stone-900/40 border-stone-800 hover:bg-stone-900 hover:border-stone-700'}
                    `}
                  >
                    {selectedArchetype.id === archetype.id && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl filter drop-shadow-lg">{archetype.icon}</span>
                      {selectedArchetype.id === archetype.id && <Sparkles size={16} className="text-amber-500" />}
                    </div>
                    <h3 className={`font-heading font-bold mb-1 ${selectedArchetype.id === archetype.id ? 'text-amber-400' : 'text-stone-300'}`}>
                      {archetype.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {archetype.description}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-2 p-3 bg-stone-900/30 rounded border border-stone-800 flex gap-3 text-xs text-stone-500">
                 <Info className="w-4 h-4 shrink-0" />
                 <p>Select an archetype, then press the center button to generate a photorealistic transformation.</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-sm text-stone-500 font-bold uppercase tracking-wider mb-2 px-2">Try On Relics</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                   onClick={() => setSelectedAccessory(null)}
                   className={`p-4 rounded-xl border text-left transition-all ${!selectedAccessory ? 'border-red-500 bg-stone-800' : 'border-stone-800 bg-stone-900/40'}`}
                >
                  <span className="text-2xl block mb-2">❌</span>
                  <span className="text-sm font-bold">None</span>
                </button>
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccessory(acc)}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${selectedAccessory?.id === acc.id 
                        ? 'border-amber-500 bg-amber-900/20 ring-1 ring-amber-500/50' 
                        : 'border-stone-800 bg-stone-900/40 hover:bg-stone-800'}
                    `}
                  >
                    <span className="text-2xl block mb-2">{acc.icon}</span>
                    <span className="text-sm font-bold block text-stone-200">{acc.name}</span>
                    <span className="text-[10px] uppercase text-stone-500 tracking-wider">{acc.type}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 relative flex flex-col h-2/3 md:h-auto">
        
        {/* Camera Container */}
        <div className="flex-1 p-2 md:p-6 flex items-center justify-center bg-stone-925 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
          
          <div className="w-full max-w-5xl aspect-video md:aspect-auto md:h-full relative flex flex-col">
             <CameraStage 
                onCapture={handleCapture} 
                isProcessing={processingState !== 'IDLE'}
                selectedAccessory={selectedAccessory}
             />
             
             {/* Historical Tooltip (Desktop/Overlay) */}
             {selectedAccessory && (
                <div className="absolute top-6 right-6 max-w-xs bg-black/80 backdrop-blur-md border border-amber-500/30 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right fade-in duration-500 hidden md:block">
                   <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-900/30 rounded-lg text-amber-500">
                         <Scroll size={20} />
                      </div>
                      <div>
                         <h4 className="text-amber-500 font-heading font-bold text-sm mb-1">{selectedAccessory.name}</h4>
                         <p className="text-xs text-stone-300 leading-relaxed italic">"{selectedAccessory.historicalSnippet}"</p>
                      </div>
                   </div>
                </div>
             )}
          </div>
        </div>
      </main>

      {/* Results Overlay Modal */}
      {(processingState !== 'IDLE' && processingState !== 'ERROR') && (
        <ResultOverlay 
          result={result} 
          isLoading={processingState === 'TRANSMUTING' || processingState === 'CONSULTING'} 
          onClose={closeOverlay}
        />
      )}
    </div>
  );
};

export default App;
