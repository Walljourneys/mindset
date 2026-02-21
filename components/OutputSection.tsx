import React, { useState } from 'react';
import { Copy, CheckCircle, Download, Image as ImageIcon, Sparkles, Hash } from 'lucide-react';
import { GeneratedContent } from '../types';

interface OutputSectionProps {
  data: GeneratedContent;
  onGenerateVisual: () => void;
  isImageLoading: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ data, onGenerateVisual, isImageLoading }) => {
  const [isCopied, setIsCopied] = useState(false);

  // FUNGSI COPY CAPTION & HASHTAG
  const handleCopy = async () => {
    const textToCopy = `${data.narrative}\n\n${data.hashtags.join(' ')}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // FUNGSI DOWNLOAD GAMBAR
  const handleDownloadImage = () => {
    if (!data.imageUrl) return;
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `TN-Visual-${Date.now()}.png`; // Nama file otomatis
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        {/* KOLOM KIRI: TEKS (NARRATIVE & HASHTAGS) */}
        <div className="p-8 lg:p-10 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-700 relative">
          
          <div className="mb-6">
            <h3 className="text-sm font-bold text-trading-green uppercase tracking-widest flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              Key Takeaway
            </h3>
            <p className="text-xl font-bold text-white leading-snug border-l-4 border-trading-green pl-4">
              "{data.keyTakeaway}"
            </p>
          </div>

          <div className="flex-grow space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Narrative Caption</h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                {data.narrative}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                <Hash className="w-4 h-4" /> Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.hashtags.map((tag, index) => (
                  <span key={index} className="text-xs font-medium text-blue-400 bg-blue-900/20 px-2 py-1 rounded-md border border-blue-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* TOMBOL COPY (Nempel di bawah kolom teks) */}
          <button
            onClick={handleCopy}
            className={`mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg
              ${isCopied 
                ? 'bg-green-600 text-white shadow-green-900/50' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:shadow-gray-900/50 border border-gray-600'
              }`}
          >
            {isCopied ? <CheckCircle className="w-5 h-5 animate-bounce" /> : <Copy className="w-5 h-5" />}
            {isCopied ? 'Caption Tersalin!' : 'Copy Caption & Hashtags'}
          </button>
        </div>

        {/* KOLOM KANAN: GAMBAR (VISUAL ENGINE) */}
        <div className="p-8 lg:p-10 bg-gray-900/50 flex flex-col items-center justify-center relative">
          
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest w-full text-left mb-6">
            Visual Story (9:16)
          </h3>

          <div className="w-full max-w-[320px] mx-auto relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700/50 group">
            
            {/* STATE 1: LOADING SHIMMER */}
            {isImageLoading && (
              <div className="w-full aspect-[9/16] bg-gray-800 animate-pulse flex flex-col items-center justify-center gap-4">
                <ImageIcon className="w-10 h-10 text-gray-600 animate-bounce" />
                <p className="text-sm text-gray-500 font-medium">AI is rendering magic...</p>
              </div>
            )}

            {/* STATE 2: GAMBAR SUDAH JADI */}
            {!isImageLoading && data.imageUrl && (
              <>
                <img 
                  src={data.imageUrl} 
                  alt="Trading Visual" 
                  className="w-full aspect-[9/16] object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* TOMBOL DOWNLOAD (Muncul saat di-hover/di HP selalu ada tapi agak transparan) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <Download className="w-5 h-5" />
                    Download 8K
                  </button>
                </div>
              </>
            )}

            {/* STATE 3: BELUM GENERATE GAMBAR */}
            {!isImageLoading && !data.imageUrl && (
              <div className="w-full aspect-[9/16] bg-gray-800/50 flex items-center justify-center p-6">
                <button
                  onClick={onGenerateVisual}
                  className="flex flex-col items-center gap-4 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="p-4 bg-gray-700 rounded-full shadow-lg">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <span className="font-medium text-sm text-center">Click to Generate<br/>Vertical Visual</span>
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OutputSection;