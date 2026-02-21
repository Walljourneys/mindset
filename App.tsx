import React, { useState } from 'react';
import { TrendingUp, AlertCircle, BarChart3, Share2, Image as ImageIcon } from 'lucide-react';
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
  
  // NEW: State untuk menyimpan pilihan mood
  const [activeMood, setActiveMood] = useState('mentor');

  // UPDATE: Terima quote dari InputSection, tapi gunakan activeMood dari state
  const handleGenerateText = async (quote: string) => {
    setLoadingState('loading');
    setError(null);
    setResult(null);

    try {
      // Kirim quote DAN mood ke AI
      const textData = await generateTradingNarrative(quote, activeMood);
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
      // Kirim takeaway DAN mood ke AI Visual
      const imageUrl = await generateTradingVisual(result.keyTakeaway, activeMood);
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
          
          {/* NEW: Mood Selector UI */}
          <div className="w-full max-w-2xl mb-8 animate-fade-in">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block text-center">
              Pilih Gaya Konten
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'mentor', label: 'Mentor', emoji: '👴', activeColor: 'border-blue-500 bg-blue-500/10 text-blue-400' },
                { id: 'tamparan', label: 'Tamparan', emoji: '🥊', activeColor: 'border-red-500 bg-red-500/10 text-red-400' },
                { id: 'stoic', label: 'Stoic', emoji: '🏛️', activeColor: 'border-teal-500 bg-teal-500/10 text-teal-400' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMood(m.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300
                    ${activeMood === m.id 
                      ? `${m.activeColor} shadow-[0_0_20px_rgba(0,0,0,0.3)] scale-105` 
                      : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:border-gray-700 hover:bg-gray-800'
                    }`}
                >
                  <span className="text-2xl mb-2 filter drop-shadow-md">{m.emoji}</span>
                  <span className="text-[11px] font-black uppercase tracking-wider">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Section tetap sama, dia tinggal manggil onGenerate pas diklik */}
          <InputSection onGenerate={handleGenerateText} isLoading={loadingState === 'loading'} />

          {loadingState === 'loading' && <LoadingSpinner />}

          {loadingState === 'error' && (
            <div className="w-full max-w-2xl mt-8 bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loadingState === 'success' && result && (
            <div className="mt-8 w-full flex justify-center">
              <OutputSection 
                data={result} 
                onGenerateVisual={handleGenerateImage} 
                isImageLoading={isImageLoading} 
              />
            </div>
          )}

          {/* Empty State / Initial Instructions */}
          {loadingState === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-12 opacity-50">
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

        <footer className="mt-20 text-center text-gray-600 text-sm">
          <p>Powered by Navigator IDX/FX • Wall Journey</p>
        </footer>
      </div>
    </div>
  );
}

export default App;