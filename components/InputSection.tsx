import React, { useState } from 'react';
import { Send, Quote } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (quote: string) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [quote, setQuote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.trim()) {
      onGenerate(quote);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-trading-green/5 border-t border-white/10">
        <div className="flex items-center gap-2 mb-4 text-gray-400">
          <Quote size={18} className="text-trading-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">Input Strategy / Quote</span>
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            className="w-full bg-trading-dark/50 border border-gray-700 rounded-xl p-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-trading-accent focus:ring-1 focus:ring-trading-accent transition-all resize-none font-sans min-h-[120px]"
            placeholder="e.g. 'Cut your losses short and let your winners run.'"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={!quote.trim() || isLoading}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98]
                ${!quote.trim() || isLoading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-trading-green to-emerald-600 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40'}
              `}
            >
              {isLoading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>
                  <span>GENERATE NARRATIVE</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputSection;