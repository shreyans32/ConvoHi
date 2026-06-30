import React from 'react';
import { MessageSquareCode, ShieldCheck, Zap, Laptop } from 'lucide-react';
const Placeholder = () => {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-500 dark:text-gray-400 p-8 text-center transition-colors duration-200">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-6">
          <svg width="220" height="160" viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md animate-pulse">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#8B5CF6" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#06B6D4" />
                <stop offset="100%" stop-color="#3B82F6" />
              </linearGradient>
            </defs>
            <circle cx="110" cy="80" r="70" fill="#3B82F6" fill-opacity="0.03" />
            <circle cx="110" cy="80" r="50" fill="#8B5CF6" fill-opacity="0.02" />
            
            <rect x="25" y="55" width="90" height="64" rx="18" fill="url(#grad2)" fill-opacity="0.85" />
            <path d="M 40 119 L 25 134 L 25 119 Z" fill="url(#grad2)" fill-opacity="0.85" />
            <circle cx="55" cy="87" r="3.5" fill="#FFFFFF" fill-opacity="0.9" />
            <circle cx="70" cy="87" r="3.5" fill="#FFFFFF" fill-opacity="0.9" />
            <circle cx="85" cy="87" r="3.5" fill="#FFFFFF" fill-opacity="0.9" />
            <rect x="85" y="30" width="100" height="70" rx="20" fill="url(#grad1)" />
            <path d="M 150 100 L 165 115 L 165 100 Z" fill="url(#grad1)" />
            <text x="135" y="75" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">Hi</text>
            <circle cx="195" cy="25" r="5" fill="#8B5CF6" />
            <circle cx="20" cy="40" r="3" fill="#06B6D4" />
            <circle cx="205" cy="95" r="4" fill="#3B82F6" />
          </svg>
        </div>
        
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
            Convo<span className="logo-gradient-text">Hi</span> Web
          </h2>
           <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Send and receive messages in real-time. Connect with friends in 1-to-1 conversations or create group channels. Experience media sharing, message edits, deletions, reactions, and read receipts.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Instant Socket Delivery</span>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Secure JWT Authentication</span>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            <Laptop className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Fully Responsive Layout</span>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
            <MessageSquareCode className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Emoji Reactions & Replies</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Placeholder;
