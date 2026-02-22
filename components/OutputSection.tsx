import React, { useState } from 'react';
import { 
  Copy, 
  CheckCircle, 
  Download, 
  Image as ImageIcon, 
  Sparkles, 
  Hash, 
  Clapperboard, 
  Mic, 
  Video,
  Share2 
} from 'lucide-react';
import { GeneratedContent } from '../types';

interface OutputSectionProps {
  data: GeneratedContent;
  onGenerateVisual: () => void;
  isImageLoading: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ data, onGenerateVisual, isImageLoading }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isScriptCopied, setIsScriptCopied] = useState(false);

  // 1. FUNGSI COPY LENGKAP
  const handleCopy = async () => {
    const formattedHashtags = data.hashtags
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
      
    const textToCopy = `"${data.keyTakeaway}"\n\n${data.narrative}\n\n${formattedHashtags}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 2. FUNGSI COPY SCRIPT VIDEO
  const handleCopyScript = async () => {
    if (!data.videoScript) return;

    const formattedScript = data.videoScript
      .map(s => `PART: ${s.part.toUpperCase()}\nVisual Direction: ${s.visual}\nAudio/Voice Over: "${s.audio}"`)
      .join('\n\n---\n\n');

    try {
      await navigator.clipboard.writeText(formattedScript);
      setIsScriptCopied(true);
      setTimeout(() => setIsScriptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script: ', err);
    }
  };

  // 3. FUNGSI DOWNLOAD: ANTI-TYPO + WATERMARK (CANVAS ENGINE)
  const handleDownloadImage = () => {
    if (!data.imageUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.src = data.imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (!ctx) return;

      // a. Gambar foto asli dari AI
      ctx.drawImage(img, 0, 0);

      // b. Setting Core Message (Anti-Typo)
      const text = data.keyTakeaway.toUpperCase(); 
      const padding = canvas.width * 0.08;
      const maxWidth = canvas.width - (padding * 2);
      const fontSize = Math.floor(canvas.width * 0.055); 
      
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      
      const words = text.split(' ');
      let line = '';
      const lines = [];
      const lineHeight = fontSize * 1.25;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      let y = canvas.height * 0.15;

      // Background Box Hitam (Readability)
      const boxHeight = lines.length * lineHeight + padding;
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(padding / 2, y - fontSize - (padding/4), canvas.width - padding, boxHeight);

      // Cetak Teks Utama
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      
      lines.forEach((l) => {
        ctx.fillText(l.trim(), canvas.width / 2, y);
        y += lineHeight;
      });

      // c. Cetak Watermark (Branding)
      ctx.shadowBlur = 0; 
      ctx.font = `bold ${fontSize * 0.5}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "right";
      const margin = canvas.width * 0.05;
      ctx.fillText("© WALL JOURNEY", canvas.width - margin, canvas.height - margin);

      // d. Trigger Download
      const finalImage = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `WallJourney-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  return (
    <div className="w-full max-w-5xl bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-700 shadow-2xl overflow-hidden animate-fade-in mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        {/* KOLOM KIRI: TEKS & SCRIPT */}
        <div className="p-8 lg:p-10 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-700 relative">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-trading-green uppercase tracking-widest flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              Core Message
            </h3>
            <p className="text-xl font-black text-white leading-tight border-l-4 border-trading-green pl-4 italic">
              "{data.keyTakeaway}"
            </p>
          </div>

          <div className="space-y-8 flex-grow">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Share2 className="w-3 h-3" /> Narrative Caption
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-medium bg-gray-900/30 p-4 rounded-xl border border-white/5">
                {data.narrative}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hash className="w-3 h-3" /> Viral Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.hashtags.map((tag, index) => (
                  <span key={index} className="text-xs font-bold text-blue-400 bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-500/20">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl
                ${isCopied 
                  ? 'bg-green-600 text-white shadow-green-900/40 scale-[0.98]' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 hover:from-gray-600 hover:to-gray-700 border border-white/10'}`}
            >
              {isCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {isCopied ? 'All Text Copied!' : 'Copy Full Caption (Inc. Core Message)'}
            </button>

            <div className="pt-8 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                  <Clapperboard className="w-4 h-4" />
                  Short Video Script
                </h3>
                <button 
                  onClick={handleCopyScript}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                    ${isScriptCopied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'}`}
                >
                  {isScriptCopied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {isScriptCopied ? 'Script Copied' : 'Copy Script for AI'}
                </button>
              </div>

              <div className="space-y-4">
                {data.videoScript?.map((step, idx) => (
                  <div key={idx} className="group bg-gray-900/50 rounded-2xl p-5 border border-white/5 hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded-md font-black uppercase tracking-tighter">
                        {step.part}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <Video className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-400 leading-snug">
                          <span className="text-gray-500 font-bold uppercase mr-1">Visual:</span>
                          {step.visual}
                        </p>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Mic className="w-4 h-4 text-trading-green mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-white font-bold leading-normal">
                          "{step.audio}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: VISUAL ENGINE */}
        <div className="p-8 lg:p-10 bg-gray-900/30 flex flex-col items-center justify-start relative">
          <div className="sticky top-10 w-full flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest w-full text-left mb-6 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Story Visual Template
            </h3>

            <div className="w-full max-w-[320px] relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[6px] border-gray-800 group">
              {isImageLoading && (
                <div className="w-full aspect-[9/16] bg-gray-800 animate-pulse flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <ImageIcon className="w-12 h-12 text-gray-700 animate-bounce" />
                    <Sparkles className="w-6 h-6 text-trading-green absolute -top-2 -right-2 animate-ping" />
                  </div>
                  <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Rendering Art...</p>
                </div>
              )}

              {!isImageLoading && data.imageUrl && (
                <>
                  <img src={data.imageUrl} className="w-full aspect-[9/16] object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-10 px-6">
                    <button onClick={handleDownloadImage} className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-tighter shadow-2xl hover:bg-trading-green transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                      <Download className="w-5 h-5" /> Download 8K PNG
                    </button>
                  </div>
                </>
              )}

              {!isImageLoading && !data.imageUrl && (
                <div className="w-full aspect-[9/16] bg-gray-800/50 flex items-center justify-center p-8 text-center">
                  <button onClick={onGenerateVisual} className="group/btn flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center shadow-2xl group-hover/btn:bg-trading-green group-hover/btn:text-black transition-all duration-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <span className="block font-black text-white uppercase tracking-widest text-sm">Generate Visual</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <p className="mt-8 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Designed for Instagram & TikTok Stories</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputSection;