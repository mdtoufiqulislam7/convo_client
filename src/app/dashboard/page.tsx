'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  Database, 
  Key, 
  CreditCard, 
  Check, 
  Clock, 
  RefreshCw, 
  LogOut, 
  PlusCircle, 
  Sparkles, 
  ShieldCheck,
  User,
  ArrowLeft,
  ArrowRight,
  Users,
  Terminal
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Dashboard view states
  const [clientTab, setClientTab] = useState<'billing' | 'products' | 'credentials'>('billing');
  const [adminTab, setAdminTab] = useState<'messages' | 'users' | 'products' | 'payments' | 'leads' | 'credentials'>('messages');

  // stats (admin only)
  const [stats, setStats] = useState({ messagesCount: 0, leadsCount: 0, productsCount: 0 });
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'active' | 'offline'>('checking');
  const [statsLoading, setStatsLoading] = useState(false);

  // Lists (Client views)
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [clientProducts, setClientProducts] = useState<any[]>([]);
  const activePlan = clientInvoices.find(inv => inv.payment_status === 'completed');
  const [billingLoading, setBillingLoading] = useState(false);
  const [prodLoading, setProdLoading] = useState(false);

  // Lists (Admin views)
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminPayments, setAdminPayments] = useState<any[]>([]);
  const [adminLeads, setAdminLeads] = useState<any[]>([]);
  const [adminProducts, setAdminProducts] = useState<any[]>([]);

  // Forms / Actions
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdKeywords, setNewProdKeywords] = useState('');
  const [prodMsg, setProdMsg] = useState('');

  const [pageName, setPageName] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState('google');
  const [voiceApiKey, setVoiceApiKey] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('bn');
  const [credMsg, setCredMsg] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // bKash redirect success details
  const [invoiceDetails, setInvoiceDetails] = useState<{ invoice_no: string; trx_id: string; status: string } | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.convoes.app';

  // Auth check & Parameter parsing
  useEffect(() => {
    const savedToken = localStorage.getItem('convoai_token');
    const savedUser = localStorage.getItem('convoai_user');

    if (!savedToken || !savedUser) {
      router.push('/');
      return;
    }

    setToken(savedToken);
    setCurrentUser(JSON.parse(savedUser));

    // Parse payment params
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get('payment_status');
    const invoiceNo = params.get('invoice_no');
    const trxId = params.get('trx_id');

    if (payStatus === 'success' && invoiceNo && trxId) {
      setInvoiceDetails({ invoice_no: invoiceNo, trx_id: trxId, status: 'success' });
      // Clear URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch data depending on user role and active tab selections
  useEffect(() => {
    if (!token || !currentUser) return;

    if (currentUser.role === 'admin') {
      fetchAdminStats();
      fetchAdminTabContent();
    } else {
      fetchClientTabContent();
    }
  }, [token, currentUser, clientTab, adminTab]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/stats`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats({
          messagesCount: data.messagesCount,
          leadsCount: data.leadsCount,
          productsCount: data.productsCount,
        });
      }

      const healthRes = await fetch(`${backendUrl}/health`);
      if (healthRes.ok) setWebhookStatus('active');
      else setWebhookStatus('offline');
    } catch (err) {
      setWebhookStatus('offline');
    }
  };

  const fetchClientTabContent = async () => {
    if (!token) return;
    if (clientTab === 'billing') {
      setBillingLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const filtered = data.payments.filter((p: any) => p.user_id === currentUser?.id);
          setClientInvoices(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBillingLoading(false);
      }
    } else if (clientTab === 'products') {
      setProdLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/user/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setClientProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setProdLoading(false);
      }
    } else if (clientTab === 'credentials') {
      fetchPageCredentials();
    }
  };

  const fetchAdminTabContent = async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (adminTab === 'messages') {
        const res = await fetch(`${backendUrl}/api/admin/messages`, { headers });
        const data = await res.json();
        if (res.ok) setAdminMessages(data.messages);
      } else if (adminTab === 'users') {
        const res = await fetch(`${backendUrl}/api/admin/users`, { headers });
        const data = await res.json();
        if (res.ok) setAdminUsers(data.users);
      } else if (adminTab === 'payments') {
        const res = await fetch(`${backendUrl}/api/admin/payments`, { headers });
        const data = await res.json();
        if (res.ok) setAdminPayments(data.payments);
      } else if (adminTab === 'leads') {
        const res = await fetch(`${backendUrl}/api/admin/leads`, { headers });
        const data = await res.json();
        if (res.ok) setAdminLeads(data.leads);
      } else if (adminTab === 'products') {
        const res = await fetch(`${backendUrl}/api/admin/products`, { headers });
        const data = await res.json();
        if (res.ok) setAdminProducts(data.products);
      } else if (adminTab === 'credentials') {
        fetchPageCredentials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPageCredentials = async () => {
    if (!token) return;
    setCredLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/user/credentials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.credentials) {
        setPageName(data.credentials.page_name || '');
        setPageId(data.credentials.page_id || '');
        setPageAccessToken(data.credentials.page_access_token || '');
        setVerifyToken(data.credentials.verify_token || '');
        setVoiceEnabled(data.credentials.voice_enabled === true);
        setVoiceProvider(data.credentials.voice_provider || 'google');
        setVoiceApiKey(data.credentials.voice_api_key || '');
        setVoiceLanguage(data.credentials.voice_language || 'bn');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCredLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCredMsg('');
    try {
      const res = await fetch(`${backendUrl}/api/user/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          pageName, 
          pageId, 
          pageAccessToken, 
          verifyToken,
          voiceEnabled,
          voiceProvider,
          voiceApiKey,
          voiceLanguage
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCredMsg('Facebook Page & AI Voice credentials saved successfully!');
      } else {
        setCredMsg(data.message || 'Failed to save credentials.');
      }
    } catch (err) {
      console.error(err);
      setCredMsg('Connection error.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProdMsg('');

    const endpoint = currentUser?.role === 'admin' ? '/api/admin/products' : '/api/user/products';

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProdName,
          price: Number(newProdPrice),
          description: newProdDesc,
          keywords: newProdKeywords
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProdMsg('Product catalog trained successfully!');
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        setNewProdKeywords('');
        
        if (currentUser?.role === 'admin') {
          fetchAdminTabContent();
          fetchAdminStats();
        } else {
          fetchClientTabContent();
        }
      } else {
        setProdMsg(data.message || 'Failed to add product.');
      }
    } catch (err) {
      console.error(err);
      setProdMsg('Connection failed.');
    }
  };

  const toggleUserRole = async (targetUserId: number, currentRole: string) => {
    if (!token) return;
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${targetUserId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchAdminTabContent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('convoai_token');
    localStorage.removeItem('convoai_user');
    router.push('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-600/30 selection:text-indigo-200">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25">
                <Bot size={18} className="text-white animate-pulse" />
              </div>
              <span className="font-extrabold text-md bg-gradient-to-r from-slate-50 to-indigo-400 bg-clip-text text-transparent">
                {isAdmin ? 'System Administrator Portal' : 'Client Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{currentUser.role} portal</span>
              </div>
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name[0].toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        
        {/* bKash Invoice Success Redirection Alert */}
        {invoiceDetails && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-slate-100 rounded-2xl space-y-4 shadow-xl shadow-emerald-500/5 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full">
                <Check size={24} />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-50">bKash Subscription Completed Successfully!</h3>
                <p className="text-xs text-slate-400">Transaction processed and recorded inside database.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-900 font-mono text-xs space-y-1.5 max-w-md">
              <div>Invoice Number: <span className="text-slate-200">{invoiceDetails.invoice_no}</span></div>
              <div>bKash TrxID:   <span className="text-slate-200">{invoiceDetails.trx_id}</span></div>
              <div>Payment Status: <span className="text-emerald-400 uppercase font-semibold">Completed</span></div>
            </div>

            <p className="text-xs text-indigo-400 font-bold flex items-center gap-1.5 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10 w-fit">
              <Clock size={14} className="animate-spin" /> Our tech team will contact you soon within 24 hours.
            </p>
          </div>
        )}

        {/* =========================================
            ADMIN PORTAL VIEW
            ========================================= */}
        {isAdmin && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Diagnostics Stats */}
            <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-900 pb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                    <Terminal size={18} className="text-indigo-400" /> Admin Diagnostics Panel
                  </h2>
                  <p className="text-xs text-slate-400">Secure overview of server endpoints, database connections, and active logs.</p>
                </div>

                <div className="flex items-center space-x-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    webhookStatus === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                  }`} />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">VPS Endpoint State</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {webhookStatus === 'active' ? 'SSL Active (api.convoes.app)' : 'Server Connection Offline'}
                    </span>
                  </div>
                  <button 
                    onClick={fetchAdminStats}
                    disabled={statsLoading}
                    className="p-1 text-slate-500 hover:text-slate-200 rounded-md transition-colors"
                  >
                    <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">AI Webhook Replies</span>
                    <p className="text-2xl font-black text-slate-100">{stats.messagesCount}</p>
                  </div>
                  <MessageSquare size={18} className="text-indigo-400" />
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Captured Leads</span>
                    <p className="text-2xl font-black text-slate-100">{stats.leadsCount}</p>
                  </div>
                  <Users size={18} className="text-indigo-400" />
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Database Products</span>
                    <p className="text-2xl font-black text-slate-100">{stats.productsCount}</p>
                  </div>
                  <Database size={18} className="text-indigo-400" />
                </div>
              </div>
            </div>

            {/* Admin SubTab Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-4">
              <button
                onClick={() => setAdminTab('messages')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'messages' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Webhook Chat Logs
              </button>
              <button
                onClick={() => setAdminTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                User Directory
              </button>
              <button
                onClick={() => setAdminTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Product Catalog & Training
              </button>
              <button
                onClick={() => setAdminTab('payments')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'payments' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Transactions & Invoices
              </button>
              <button
                onClick={() => setAdminTab('leads')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'leads' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                SaaS Leads
              </button>
              <button
                onClick={() => setAdminTab('credentials')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  adminTab === 'credentials' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                Page Credentials
              </button>
            </div>

            {/* Admin Webhook chat logs tab */}
            {adminTab === 'messages' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-400" /> Webhook Message Auto-Replies Log
                </h3>
                {adminMessages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No chat messages found in DB.</div>
                ) : (
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Sender PSID</th>
                          <th className="py-2.5 px-3">Message</th>
                          <th className="py-2.5 px-3">AI Response</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminMessages.map((msg) => (
                          <tr key={msg.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-355">
                            <td className="py-3 px-3 font-mono">{msg.sender_id}</td>
                            <td className="py-3 px-3 text-slate-200">{msg.message_text}</td>
                            <td className="py-3 px-3 italic bg-slate-950/20 text-slate-400 max-w-sm truncate">{msg.response_text}</td>
                            <td className="py-3 px-3">{new Date(msg.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin user directory tab */}
            {adminTab === 'users' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" /> User Accounts
                </h3>
                {adminUsers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No users found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">ID</th>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((usr) => (
                          <tr key={usr.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-355">
                            <td className="py-2.5 px-3">{usr.id}</td>
                            <td className="py-2.5 px-3 text-slate-200 font-semibold">{usr.name}</td>
                            <td className="py-2.5 px-3 font-mono">{usr.email}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                usr.role === 'admin' ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-450 border border-indigo-500/20'
                              }`}>{usr.role}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => toggleUserRole(usr.id, usr.role)}
                                className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded transition-colors text-[10px] font-bold"
                              >
                                Toggle Role
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin product catalog editor tab */}
            {adminTab === 'products' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 h-fit">
                  <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <PlusCircle size={16} className="text-indigo-400" /> Add Global Product
                  </h3>
                  {prodMsg && <div className="p-2.5 bg-indigo-650/10 border border-indigo-650/20 text-indigo-400 text-xs rounded-lg mb-3">{prodMsg}</div>}
                  <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Product Title</label>
                      <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="Title" className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Price (BDT)</label>
                      <input type="number" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="Price" className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Keywords</label>
                      <input type="text" required value={newProdKeywords} onChange={e => setNewProdKeywords(e.target.value)} placeholder="Keywords" className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Description</label>
                      <textarea rows={4} required value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} placeholder="Details description context for AI answers" className="w-full bg-slate-950 border border-slate-900 rounded px-2 py-1.5 text-slate-200 resize-none" />
                    </div>
                    <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded text-white text-xs">Insert Product</button>
                  </form>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 lg:col-span-2">
                  <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Database size={16} className="text-indigo-400" /> Global Product Catalog
                  </h3>
                  {adminProducts.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">No products inside database.</div>
                  ) : (
                    <div className="overflow-y-auto max-h-[400px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Keywords</th>
                            <th className="py-2.5 px-3">Description Context</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminProducts.map((p) => (
                            <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-350">
                              <td className="py-3 px-3">{p.id}</td>
                              <td className="py-3 px-3 font-semibold text-slate-200">{p.name}</td>
                              <td className="py-3 px-3 text-indigo-400 font-bold">৳{p.price}</td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {p.keywords && p.keywords.map((k: string, idx: number) => (
                                    <span key={idx} className="bg-slate-950 px-1 py-0.5 rounded text-[10px] text-slate-400">{k}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[11px] max-w-xs truncate text-slate-450">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin payments invoices tab */}
            {adminTab === 'payments' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-indigo-400" /> SaaS billing invoices
                </h3>
                {adminPayments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No payment logs found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Invoice No</th>
                          <th className="py-2.5 px-3">Client</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Package</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminPayments.map((p) => (
                          <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-350">
                            <td className="py-2.5 px-3 font-mono">{p.invoice_no}</td>
                            <td className="py-2.5 px-3 text-slate-200">{p.user_name || 'Guest User'}</td>
                            <td className="py-2.5 px-3 font-mono">{p.user_email || '-'}</td>
                            <td className="py-2.5 px-3 text-slate-200">{p.package_name}</td>
                            <td className="py-2.5 px-3">৳{p.amount}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.payment_status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>{p.payment_status}</span>
                            </td>
                            <td className="py-2.5 px-3">{new Date(p.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin Custom CRM integration Leads tab */}
            {adminTab === 'leads' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" /> CRM Leads Tracker
                </h3>
                {adminLeads.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No lead submissions found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Business</th>
                          <th className="py-2.5 px-3">Facebook Page URL</th>
                          <th className="py-2.5 px-3">Email Address</th>
                          <th className="py-2.5 px-3">Catalog Context Details</th>
                          <th className="py-2.5 px-3">Received At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminLeads.map((l) => (
                          <tr key={l.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-355">
                            <td className="py-2.5 px-3 text-slate-200 font-semibold">{l.business_name}</td>
                            <td className="py-2.5 px-3 font-mono text-indigo-400 max-w-xs truncate">
                              <a href={l.page_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{l.page_url}</a>
                            </td>
                            <td className="py-2.5 px-3 font-mono">{l.contact_email}</td>
                            <td className="py-2.5 px-3 text-slate-450 max-w-xs truncate">{l.custom_product_catalog}</td>
                            <td className="py-2.5 px-3">{new Date(l.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin page credentials tab */}
            {adminTab === 'credentials' && (
              <div className="max-w-2xl bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                    <Key size={16} className="text-indigo-400" /> System Facebook Page API Hook Credentials
                  </h3>
                  <p className="text-xs text-slate-400">Configure global page keys and verify secrets for chatbot routing.</p>
                </div>
                {credMsg && <div className="p-3 bg-indigo-650/10 border border-indigo-650/20 text-indigo-400 text-xs rounded-lg mb-4">{credMsg}</div>}
                <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Page Name</label>
                      <input type="text" required value={pageName} onChange={e => setPageName(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Page ID</label>
                      <input type="text" required value={pageId} onChange={e => setPageId(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Verify Token (Custom Secret)</label>
                    <input type="text" required value={verifyToken} onChange={e => setVerifyToken(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Facebook Page Access Token</label>
                    <textarea rows={4} required value={pageAccessToken} onChange={e => setPageAccessToken(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 font-mono resize-none text-[11px]" />
                  </div>
                  <button type="submit" disabled={credLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded text-white text-xs">Save System Credentials</button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* =========================================
            CLIENT PORTAL VIEW
            ========================================= */}
        {!isAdmin && (
          <div className="space-y-8">
              
              {/* Active Plan details card */}
              {activePlan && (
                <div className="p-6 bg-indigo-600/10 border border-indigo-500/25 text-slate-100 rounded-2xl space-y-4 shadow-xl shadow-indigo-600/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider">
                        Active Subscription
                      </span>
                      <h3 className="text-lg font-black text-slate-50 flex items-center gap-1.5">
                        <ShieldCheck size={18} className="text-indigo-400 animate-pulse" />
                        {activePlan.plan_name || activePlan.package_name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paid: <span className="text-indigo-400 font-bold">৳{Number(activePlan.amount).toLocaleString()} BDT</span> via bKash (Trx ID: <span className="font-mono text-[11px]">{activePlan.bkash_trx_id}</span>)
                      </p>
                    </div>
                    
                    {activePlan.plan_features && activePlan.plan_features.length > 0 && (
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900/60 max-w-sm w-full">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Plan Features Included:</span>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                          {activePlan.plan_features.map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check size={12} className="text-indigo-400" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Client Tab selector */}
              <div className="flex items-center space-x-2 border-b border-slate-900 pb-4">
                <button
                  onClick={() => setClientTab('billing')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    clientTab === 'billing' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard size={14} className="inline mr-1.5" /> Invoices & Billing
                </button>
              <button
                onClick={() => setClientTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  clientTab === 'products' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database size={14} className="inline mr-1.5" /> Product Catalog
              </button>
              <button
                onClick={() => setClientTab('credentials')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  clientTab === 'credentials' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key size={14} className="inline mr-1.5" /> Page Credentials
              </button>
            </div>

            {/* Client billing invoices tab */}
            {clientTab === 'billing' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 animate-fade-in">
                <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-indigo-400" /> Subscription Billing Log History
                </h3>
                {billingLoading ? (
                  <div className="text-center py-8 text-xs text-slate-500 animate-pulse">Loading billing logs...</div>
                ) : clientInvoices.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">No subscription billing records mapped to your account.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3">Invoice No</th>
                          <th className="py-2.5 px-3">Package Name</th>
                          <th className="py-2.5 px-3">Amount Paid</th>
                          <th className="py-2.5 px-3">bKash TrxID</th>
                          <th className="py-2.5 px-3">Payment Status</th>
                          <th className="py-2.5 px-3">Billing Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientInvoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-slate-900 hover:bg-slate-900/20 text-slate-350">
                            <td className="py-2.5 px-3 font-mono">{inv.invoice_no}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-200">{inv.package_name}</td>
                            <td className="py-2.5 px-3">৳{inv.amount}</td>
                            <td className="py-2.5 px-3 font-mono">{inv.bkash_trx_id || '-'}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.payment_status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>{inv.payment_status}</span>
                            </td>
                            <td className="py-2.5 px-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Client custom user products catalog mapping tab */}
            {clientTab === 'products' && (
              !activePlan ? (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-6 animate-fade-in py-12">
                  <div className="h-16 w-16 bg-indigo-600/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Bot size={32} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-50">Subscription Required</h3>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      You need an active subscription package to configure Facebook page integrations and train the chatbot catalog.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Choose a Subscription Plan</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 h-fit">
                  <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <PlusCircle size={16} className="text-indigo-400" /> Train Bot on New Product
                  </h3>
                  {prodMsg && <div className="p-2.5 bg-indigo-650/10 border border-indigo-650/20 text-indigo-400 text-xs rounded-lg mb-3">{prodMsg}</div>}
                  <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Title</label>
                      <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="Title" className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price (BDT)</label>
                      <input type="number" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="Price" className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Keywords</label>
                      <input type="text" required value={newProdKeywords} onChange={e => setNewProdKeywords(e.target.value)} placeholder="Keywords" className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description Context</label>
                      <textarea rows={4} required value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} placeholder="Details description for AI responses" className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-600 resize-none" />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded text-white text-xs">Create & Link to Catalog</button>
                  </form>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 lg:col-span-2">
                  <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Database size={16} className="text-indigo-400" /> Your Custom Trained Product Assets
                  </h3>
                  {prodLoading ? (
                    <div className="text-center py-8 text-xs text-slate-500 animate-pulse">Loading catalog...</div>
                  ) : clientProducts.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">No products inside your catalog database. Add a product to start.</div>
                  ) : (
                    <div className="overflow-y-auto max-h-[500px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Price</th>
                            <th className="py-2.5 px-3">Keywords</th>
                            <th className="py-2.5 px-3">Description context</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientProducts.map((p) => (
                            <tr key={p.id} className="border-b border-slate-900 hover:bg-slate-900/10 text-slate-350">
                              <td className="py-3 px-3">{p.id}</td>
                              <td className="py-3 px-3 font-semibold text-slate-200">{p.name}</td>
                              <td className="py-3 px-3 font-bold text-indigo-400">৳{p.price}</td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {p.keywords && p.keywords.map((k: string, idx: number) => (
                                    <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400">{k}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs truncate">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

            {/* Client page credentials tab */}
            {clientTab === 'credentials' && (
              !activePlan ? (
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-6 animate-fade-in py-12">
                  <div className="h-16 w-16 bg-indigo-600/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Bot size={32} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-50">Subscription Required</h3>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      You need an active subscription package to configure Facebook page integrations and train the chatbot catalog.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Choose a Subscription Plan</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="max-w-2xl bg-slate-900/30 border border-slate-900 rounded-2xl p-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                    <Key size={16} className="text-indigo-400" /> Facebook Page API Hook Credentials
                  </h3>
                  <p className="text-xs text-slate-400">Configure your specific page tokens and verify secrets for chatbot routing.</p>
                </div>
                {credMsg && <div className="p-3 bg-indigo-650/10 border border-indigo-650/20 text-indigo-400 text-xs rounded-lg mb-4">{credMsg}</div>}
                <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Page Name</label>
                      <input type="text" required value={pageName} onChange={e => setPageName(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Page ID</label>
                      <input type="text" required value={pageId} onChange={e => setPageId(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Verify Token (Custom Secret)</label>
                    <input type="text" required value={verifyToken} onChange={e => setVerifyToken(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Facebook Page Access Token</label>
                    <textarea rows={4} required value={pageAccessToken} onChange={e => setPageAccessToken(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-2 text-slate-200 font-mono resize-none text-[11px]" />
                  </div>
                  {/* Voice replies settings divider */}
                  <hr className="border-slate-900 my-4" />
                  <div className="space-y-4 mb-5">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot size={14} /> AI Voice Replies (Voice-over-Chat)
                    </h4>
                    
                    <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      <input
                        type="checkbox"
                        id="voiceEnabled"
                        checked={voiceEnabled}
                        onChange={(e) => setVoiceEnabled(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-650 focus:ring-indigo-650 focus:ring-offset-slate-950 h-4 w-4"
                      />
                      <label htmlFor="voiceEnabled" className="text-xs font-semibold text-slate-350 cursor-pointer select-none">
                        Enable Automatic AI Voice Message Replies on Messenger
                      </label>
                    </div>

                    {voiceEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-900 animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Voice Provider</label>
                          <select
                            value={voiceProvider}
                            onChange={(e) => setVoiceProvider(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                          >
                            <option value="google">Google Translate TTS (Free, Multilingual)</option>
                            <option value="openai">OpenAI TTS (Premium)</option>
                            <option value="elevenlabs">ElevenLabs (Premium, Natural)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Voice Language</label>
                          <select
                            value={voiceLanguage}
                            onChange={(e) => setVoiceLanguage(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                          >
                            <option value="bn">Bengali (bn)</option>
                            <option value="en">English (en)</option>
                          </select>
                        </div>

                        {(voiceProvider === 'openai' || voiceProvider === 'elevenlabs') && (
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              {voiceProvider === 'openai' ? 'OpenAI API Key' : 'ElevenLabs API Key'}
                            </label>
                            <input
                              type="password"
                              required
                              value={voiceApiKey}
                              onChange={(e) => setVoiceApiKey(e.target.value)}
                              placeholder={voiceProvider === 'openai' ? 'sk-...' : 'Your elevenlabs API key'}
                              className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-600 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={credLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded text-white text-xs">Save Credentials</button>
                </form>
              </div>
            )
          )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-slate-655 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span>&copy; 2026 ConvoAI Technologies. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
