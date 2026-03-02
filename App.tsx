import React, { useState } from 'react';
import { TrendingUp, AlertCircle, BarChart3, Share2, Image as ImageIcon, Globe, Building2, Zap } from 'lucide-react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import LoadingSpinner from './components/LoadingSpinner';
import { generateTradingNarrative, generateTradingVisual } from './services/geminiService';
import { GeneratedContent, LoadingState } from './types';

function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk menyimpan pilihan mood
  const [activeMood, setActiveMood] = useState('mentor');
  
  // NEW: State untuk menyimpan pilihan Market Target
  const [activeMarket, setActiveMarket] = useState<'IDX' | 'GLOBAL' | 'UNIVERSAL'>('UNIVERSAL');

  // UPDATE: Terima quote dari InputSection, kirim quote, mood, DAN market
  const handleGenerateText = async (quote: string) => {
    setLoadingState('loading');
    setError(null);
    setResult(null);

    try {
      // Kirim quote, mood, dan target market ke AI
      const textData = await generateTradingNarrative(quote, activeMood, activeMarket);
      setResult(textData);
      setLoadingState('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your API key.");
      setLoadingState('error');
    }
  };

  const handleGenerateImage = async () => {
    if (!result || isImageLoading) return;
    
    setIsImageLoading(true);
    try {
      // Kirim visualDescription (deskripsi scene unik dari AI) 
      // dan keyTakeaway (teks untuk ditulis di background)
      const imageUrl = await generateTradingVisual(result.visualDescription, result.keyTakeaway);
      
      if (imageUrl) {
        setResult({ ...result, imageUrl });
      }
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-trading-dark text-gray-200 selection:bg-trading-green selection:text-black">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-trading-green/5 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-trading-accent/5 rounded-full blur-[128px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        
        {/* Header */}
        <header className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trading-green/10 text-trading-green border border-trading-green/20 mb-6 animate-fade-in">
            <TrendingUp size={14} />
            <span className="text-xs font-bold tracking-wider uppercase">Trading Psychology</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-trading-green to-teal-400">Mindset</span>.
          </h1>
          
          <p className="text-lg text-gray-400 leading-relaxed">
            Trade Navigation System by Wall Journey
          </p>
        </header>

        {/* Main Content Area */}
        <main className="w-full flex flex-col items-center">
          
          <div className="w-full max-w-2xl mb-8 flex flex-col md:flex-row gap-6 animate-fade-in">
            
            {/* Market Selector UI */}
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block text-center md:text-left">
                Target Market
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'IDX', label: 'IDX (Lokal)', icon: <Building2 size={18} />, color: 'border-cyan-500 bg-cyan-500/10 text-cyan-400' },
                  { id: 'GLOBAL', label: 'Global (FX/Gold)', icon: <Globe size={18} />, color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                  { id: 'UNIVERSAL', label: 'Universal', icon: <Zap size={18} />, color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMarket(m.id as any)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-300
                      ${activeMarket === m.id 
                        ? `${m.color} shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105` 
                        : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:border-gray-700 hover:bg-gray-800 hover:text-gray-300'
                      }`}
                  >
                    <span className="mb-1">{m.icon}</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Selector UI */}
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block text-center md:text-left">
                Gaya Konten
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mentor', label: 'Mentor', emoji: '👴', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
                  { id: 'tamparan', label: 'Tamparan', emoji: '🥊', color: 'border-red-500 bg-red-500/10 text-red-400' },
                  { id: 'stoic', label: 'Stoic', emoji: '🏛️', color: 'border-purple-500 bg-purple-500/10 text-purple-400' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMood(m.id)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-300
                      ${activeMood === m.id 
                        ? `${m.color} shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105` 
                        : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:border-gray-700 hover:bg-gray-800 hover:text-gray-300'
                      }`}
                  >
                    <span className="text-lg mb-1 filter drop-shadow-md">{m.emoji}</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Input Section */}
          <InputSection onGenerate={handleGenerateText} isLoading={loadingState === 'loading'} />

          {loadingState === 'loading' && <LoadingSpinner />}

          {loadingState === 'error' && (
            <div className="w-full max-w-2xl mt-8 bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loadingState === 'success' && result && (
            <div className="mt-8 w-full flex justify-center animate-fade-in">
              <OutputSection 
                data={result} 
                onGenerateVisual={handleGenerateImage} 
                isImageLoading={isImageLoading} 
              />
            </div>
          )}

          {/* Empty State / Initial Instructions */}
          {loadingState === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-12 opacity-50 animate-fade-in">
              <div className="p-6 rounded-xl border border-white/5 bg-white/5">
                <BarChart3 className="mb-3 text-gray-500" />
                <h3 className="font-bold text-white mb-2">Quote Input</h3>
                <p className="text-sm text-gray-500">Input your strategy or mindset quote.</p>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-white/5">
                <Share2 className="mb-3 text-gray-500" />
                <h3 className="font-bold text-white mb-2">Narrative</h3>
                <p className="text-sm text-gray-500">Get a professionally written disciplined caption.</p>
              </div>
              <div className="p-6 rounded-xl border border-white/5 bg-white/5">
                <ImageIcon className="mb-3 text-gray-500" />
                <h3 className="font-bold text-white mb-2">Custom Visual</h3>
                <p className="text-sm text-gray-500">Click to generate a clean 9:16 vertical image for stories.</p>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-gray-600 text-[10px] tracking-widest uppercase font-bold">
          <p>Powered by Navigator IDX & GLOBAL • Wall Journey</p>
        </footer>
      </div>
    </div>
  );
}

export default App;