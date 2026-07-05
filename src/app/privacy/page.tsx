'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Lock, Database, Eye, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-600/30 selection:text-indigo-200 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-all"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-650 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-sm text-slate-200">ConvoAI</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-10 relative">
        
        {/* Banner Title */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
            Privacy Policy & Compliance
          </span>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: July 5, 2026. This policy explains how ConvoAI collects, processes, and protects your Facebook Page message data.
          </p>
        </div>

        <hr className="border-slate-900" />

        {/* Pin Points Section */}
        <div className="space-y-8">
          
          {/* 1. Data Collection */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <Eye size={18} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">1. Information We Collect</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you integrate ConvoAI with your Facebook Page, we collect incoming text messages, Page-Scoped User IDs (PSID), and customer names solely to process replies. If a user provides delivery numbers or address details during sales conversations, we capture and save them as business leads in your private database.
              </p>
            </div>
          </div>

          {/* 2. Processing & AI */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <Lock size={18} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">2. AI Data Processing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We pass text query contents securely to Google Gemini or OpenAI API to automatically find matching products and formulate replies. We do not use customer conversations to train public AI models. All messages are transmitted using secure HTTPS protocols.
              </p>
            </div>
          </div>

          {/* 3. Storage and Safety */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <Database size={18} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">3. Data Retention & Control</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversation logs and leads are saved in a protected, managed database. Business admins can view, download, or permanently delete customer logs or lead details at any time through the secure dashboard portal.
              </p>
            </div>
          </div>

          {/* 4. Compliance and Meta Roles */}
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
              <Globe size={18} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">4. Meta App Review & Third-Party Disclosure</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This app requests the <strong>pages_messaging</strong> permission to respond to your customers. We never sell, exchange, or share your page conversation log or contact list with any external third-party advertisers. All records are restricted to your dedicated account.
              </p>
            </div>
          </div>

        </div>

        {/* Contact Info Box */}
        <div className="p-6 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-2.5">
          <h4 className="text-xs font-bold text-slate-200">Questions or Data Deletion Requests?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you wish to terminate your page bot integration, request the deletion of your account logs, or raise compliance questions, please contact our support team at <span className="text-indigo-400 font-semibold">support@convoes.app</span>.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-slate-650 text-center text-xs">
        <div className="max-w-4xl mx-auto px-4">
          <span>&copy; 2026 ConvoAI Technologies. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
