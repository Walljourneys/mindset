import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="relative">
        <div className="absolute inset-0 bg-trading-green blur-xl opacity-20 animate-pulse rounded-full"></div>
        <Activity className="w-12 h-12 text-trading-green animate-bounce" />
      </div>
      <p className="text-trading-accent font-mono text-sm animate-pulse">
        Analyzing Market Sentiment...
      </p>
    </div>
  );
};

export default LoadingSpinner;