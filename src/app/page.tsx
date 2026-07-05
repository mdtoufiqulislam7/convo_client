'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Sparkles, 
  Check, 
  Zap,
  RefreshCw,
  LogOut,
  LogIn,
  CreditCard,
  PlusCircle,
  Users,
  Database,
  Code,
  ArrowRight
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingPlan, setPendingPlan] = useState<{ id: number; name: string; price: number } | null>(null);
  
  const [plans, setPlans] = useState<any[]>([
    { id: 1, name: 'Basic Automation Setup', price: 2900, description: 'Standard response setup for small business FB pages.', features: ['Up to 50 Products catalog', 'Keyword smart matching', 'Gemini Auto-replies'] },
    { id: 2, name: 'Advanced Vector Search Bundle', price: 7900, description: 'Advanced vector search indexing for dynamic product inventories.', features: ['Up to 500 Products catalog', 'Keyword + Description search', 'Advanced context parsing'] },
    { id: 3, name: 'Custom Automation Suite', price: 19900, description: 'Custom API integrations and dedicated support resources.', features: ['Unlimited Products catalog', 'Dedicated database indexer', '24/7 dedicated developer Support'] }
  ]);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.convoes.app';

  // Load active session and fetch subscription plans on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('convoai_token');
    const savedUser = localStorage.getItem('convoai_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }

    const fetchPlans = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/subscription-plans`);
        const data = await res.json();
        if (res.ok && data.success && data.plans.length > 0) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
      }
    };
    fetchPlans();
  }, []);

  // Handle plan purchase trigger
  const handlePurchasePlan = (planId: number, planName: string, price: number) => {
    if (!token || !currentUser) {
      // Prompt sign in first
      setPendingPlan({ id: planId, name: planName, price });
      setIsAuthOpen(true);
      return;
    }

    triggerCheckout(planId, planName, price, token);
  };

  // Trigger bKash checkout
  const triggerCheckout = async (planId: number, planName: string, price: number, activeToken: string) => {
    try {
      console.log(`Initiating bKash payment of BDT ${price} for ${planName}...`);
      const res = await fetch(`${backendUrl}/api/bkash/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          amount: price,
          packageName: planName,
          subscriptionId: planId,
          simulate: false // Attempts real tokenized bKash payment gateway
        })
      });

      const data = await res.json();
      if (res.ok && data.bkashURL) {
        window.location.href = data.bkashURL;
      } else {
        alert(data.message || 'Payment initiation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network connection error.');
    }
  };

  // Handle auth success callback
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setCurrentUser(newUser);
    setIsAuthOpen(false);
    
    // If checkout was pending, run it immediately using the new session token
    if (pendingPlan) {
      triggerCheckout(pendingPlan.id, pendingPlan.name, pendingPlan.price, newToken);
      setPendingPlan(null);
    } else {
      // Redirect to dashboard page
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-200 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-slate-50 to-indigo-400 bg-clip-text text-transparent">
                ConvoAI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block -mt-1">
                Management
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-xs font-bold rounded-lg text-indigo-400 border border-indigo-500/20 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white transition-all shadow-md shadow-indigo-600/20"
              >
                <LogIn size={13} />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">
        
        {/* Welcome marketing banner */}
        <div className="p-8 bg-slate-900/35 border border-slate-900 rounded-3xl backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Facebook Page Auto-Reply Assistant
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-50 leading-tight">
              Automate Sales & Customer Service Instantly <Sparkles size={20} className="inline text-indigo-400 ml-1" />
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Let Gemini AI handle your Facebook page messages. Auto-reply to product prices, dry fruit details, delivery rules, and capture customer orders 24/7.
            </p>
          </div>
          <div className="h-fit">
            <button
              onClick={() => {
                if (token) router.push('/dashboard');
                else setIsAuthOpen(true);
              }}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Start Automating Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Feature Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-350">
          <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 hover:border-slate-800/80 transition-colors">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400">
              <Bot size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Smart AI Product Lookup</h4>
            <p className="text-xs text-slate-400">
              Matches customer queries against your products database. Automatically replies with prices and descriptions for matching items.
            </p>
          </div>

          <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 hover:border-slate-800/80 transition-colors">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400">
              <CreditCard size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-100">bKash Subscription Billing</h4>
            <p className="text-xs text-slate-400">
              Purchase automated plans securely via bKash. Generates professional invoices, complete with transaction ID logging.
            </p>
          </div>

          <div className="p-5 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 hover:border-slate-800/80 transition-colors">
            <div className="h-10 w-10 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-400">
              <Users size={18} />
            </div>
            <h4 className="text-sm font-bold text-slate-100">Order & Lead Capture</h4>
            <p className="text-xs text-slate-400">
              Extracts customer addresses and mobile numbers from conversations, saving them as leads inside your dashboard.
            </p>
          </div>
        </div>

        {/* Packages pricing tiers */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-50">SaaS Subscription Packages</h2>
            <p className="text-xs text-slate-400 mt-1">Select an automated response subscription plan. You must register/login to checkout.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isRecommended = plan.name.includes('Vector');
              return (
                <div 
                  key={plan.id} 
                  className={`bg-slate-900/40 border rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition-colors relative ${
                    isRecommended ? 'border-indigo-600 shadow-lg shadow-indigo-600/5 bg-slate-900/50' : 'border-slate-900'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 right-6 px-2.5 py-0.5 bg-indigo-600 text-[9px] font-black text-white uppercase tracking-wider rounded-full">
                      Recommended
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider">
                        {plan.price >= 19000 ? 'Enterprise' : isRecommended ? 'Premium' : 'Client'}
                      </span>
                      {isRecommended ? (
                        <Sparkles size={14} className="text-indigo-400" />
                      ) : plan.price >= 19000 ? (
                        <Code size={14} className="text-slate-500" />
                      ) : (
                        <Zap size={14} className="text-slate-650" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-md font-bold text-slate-100">{plan.name}</h4>
                      <p className="text-[11px] text-slate-500">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-50">৳{Number(plan.price).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500">/ BDT</span>
                    </div>
                    <hr className="border-slate-950" />
                    <ul className="space-y-2 text-xs text-slate-400">
                      {plan.features && plan.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check size={12} className="text-indigo-400" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => handlePurchasePlan(plan.id, plan.name, Number(plan.price))}
                      className={`w-full py-2 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                        isRecommended 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600' 
                          : 'bg-slate-950 hover:bg-indigo-600 text-slate-300 border-slate-800 hover:border-indigo-600'
                      }`}
                    >
                      <span>Subscribe with bKash</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-slate-650 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; 2026 ConvoAI Technologies. All rights reserved.</span>
          <button
            onClick={() => router.push('/privacy')}
            className="hover:text-indigo-400 transition-colors font-medium"
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      {/* Register/Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingPlan(null);
        }}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}
