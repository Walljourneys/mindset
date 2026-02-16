import React, { useState } from 'react';
import { Copy, Check, Hash, Bookmark, Share2, Download, ImageIcon, Sparkles } from 'lucide-react';
import { GeneratedContent } from '../types';

interface OutputSectionProps {
  data: GeneratedContent;
  onGenerateVisual: () => void;
  isImageLoading: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ data, onGenerateVisual, isImageLoading }) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  const copyToClipboard = (text: string, isTags: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTags) {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const downloadImage = () => {
    if (!data.imageUrl) return;
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `trading-visual-${Date.now()}.png`;
    link.click();
  };

  const hashtagsString = data.hashtags.join(' ');

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up space-y-8">
      
      {/* 1. Key Takeaway */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-indigo-500/10">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
          <Bookmark size={20} />
        </div>
        <div>
          <h3 className="text-xs font-mono uppercase text-indigo-300 mb-1 tracking-widest">Psychological Lesson</h3>
          <p className="text-indigo-100 font-medium leading-relaxed">{data.keyTakeaway}</p>
        </div>
      </div>

      {/* 2. Narrative Narrative */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-trading-red"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-trading-green"></div>
          </div>
          <span className="text-xs font-mono text-gray-500 tracking-wider">CAPTION_STRATEGY.txt</span>
        </div>

        <div className="p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-gray-300 leading-7 text-base md:text-lg font-sans">
              {data.narrative}
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => copyToClipboard(data.narrative, false)}
              className="flex items-center gap-2 text-sm font-bold text-trading-accent hover:text-white transition-all bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10"
            >
              {copiedText ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedText ? 'Copied to clipboard' : 'Copy Caption'}</span>
            </button>
          </div>
        </div>

        {/* 3. Hashtags Section */}
        <div className="bg-black/20 p-6 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <Hash size={16} className="text-trading-green" />
            <span className="text-xs font-mono uppercase tracking-widest">Growth Hashtags</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-trading-green/80 break-words leading-relaxed select-all">
            {hashtagsString}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-gray-600 font-mono italic">{data.hashtags.length} tags total</span>
            <button
              onClick={() => copyToClipboard(hashtagsString, true)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-trading-green transition-colors font-bold"
            >
              {copiedTags ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copiedTags ? 'Copied' : 'Copy All Tags'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Visual Generation Section (Paling Bawah) */}
      <div className="pt-8 flex flex-col items-center">
        {!data.imageUrl && !isImageLoading && (
          <button
            onClick={onGenerateVisual}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-trading-accent to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all group"
          >
            <ImageIcon className="group-hover:rotate-12 transition-transform" />
            <span>GENERATE 9:16 VISUAL</span>
            <Sparkles size={18} className="animate-pulse" />
          </button>
        )}

        {isImageLoading && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-trading-accent/20 border-t-trading-accent rounded-full animate-spin mx-auto"></div>
            <p className="text-trading-accent font-mono text-sm animate-pulse">Designing visual asset...</p>
          </div>
        )}

        {data.imageUrl && (
          <div className="w-full animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <ImageIcon size={18} className="text-trading-accent" />
              <span className="text-xs font-mono uppercase tracking-widest">Final Visual Output (9:16)</span>
            </div>
            
            <div className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex justify-center bg-black/60 max-w-sm mx-auto">
              <img 
                src={data.imageUrl} 
                alt="Trading Visual 9:16" 
                className="w-full h-auto object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-8">
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform"
                >
                  <Download size={20} />
                  SAVE FOR STORIES
                </button>
              </div>
            </div>
            
            <p className="text-center text-gray-600 text-xs mt-4 font-mono">
              Vertical resolution optimized for Instagram Reels, Stories, and TikTok.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputSection;
