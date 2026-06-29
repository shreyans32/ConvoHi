import React from 'react';
import { MessageSquareCode, ShieldCheck, Zap, Laptop } from 'lucide-react';
const Placeholder = () => {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-500 dark:text-gray-400 p-8 text-center transition-colors duration-200">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-md text-3xl font-black animate-pulse">
          Hi
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
