"use client";

import { useState } from "react";
import { Show, RedirectToSignIn, UserButton, SignInButton } from "@clerk/nextjs";
import { Wallet, ArrowRightLeft, ShieldCheck, Activity, Globe, Zap, ArrowUpRight, ArrowDownRight, CreditCard, Send, Plus } from "lucide-react";
import { depositFunds, transferFundsOnline } from "@/lib/actions";
import { motion } from "framer-motion";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

// Simple mock chart data to simulate growth from genesis to current
function generateChartData(balance: number) {
  return [
    { time: 'T-6', balance: balance * 0.4 },
    { time: 'T-5', balance: balance * 0.5 },
    { time: 'T-4', balance: balance * 0.8 },
    { time: 'T-3', balance: balance * 0.75 },
    { time: 'T-2', balance: balance * 0.9 },
    { time: 'T-1', balance: balance * 0.95 },
    { time: 'Now', balance: balance },
  ];
}

export default function DashboardUI({ walletData, transactions, clerkId, name, email }: { walletData: any, transactions: any[], clerkId?: string, name?: string, email?: string }) {
  const chartData = generateChartData(walletData?.syncedBalance || 10000);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    setLoading(true);
    await depositFunds(Number(depositAmount));
    setLoading(false);
    setIsDepositOpen(false);
    window.location.reload(); // Quick refresh to get new server data
  };

  const handleTransfer = async () => {
    if (!transferAmount || isNaN(Number(transferAmount)) || !transferEmail) return;
    setLoading(true);
    const res = await transferFundsOnline(transferEmail, Number(transferAmount));
    setLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      setIsTransferOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020817] selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl fixed top-0 left-0 w-full z-50">
        <div className="w-full mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-400 p-2.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white whitespace-nowrap">
              Harsh<span className="text-emerald-400">Bank</span>
            </h1>
          </motion.div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-[#020817] px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] whitespace-nowrap">
                  Access Portal
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="p-0.5 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors shadow-lg">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 rounded-full",
                      userButtonPopoverCard: "bg-[#0f172a] border border-white/10 shadow-2xl",
                      userButtonPopoverActionButton: "hover:bg-white/5 text-white",
                      userButtonPopoverActionButtonText: "text-gray-300",
                      userButtonPopoverFooter: "hidden",
                    }
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 relative z-10">
        
        {/* === LOGGED OUT VIEW (REDIRECT TO LOGIN) === */}
        <Show when="signed-out">
          <RedirectToSignIn />
        </Show>

        {/* === LOGGED IN VIEW (DASHBOARD) === */}
        <Show when="signed-in">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-2">Central Command</h2>
                <p className="text-gray-400">Welcome back, <span className="text-white font-semibold">{name || 'Admin'}</span>. Your ledger is fully synchronized.</p>
                {clerkId && <p className="text-xs text-gray-600 mt-2 font-mono">App Sync ID: {clerkId}</p>}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-bold tracking-wide uppercase">Node Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Box 1: Vault Balance */}
              <div className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-[#0a101f] border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-center">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-emerald-400 font-semibold tracking-wider uppercase text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Vault Balance
                  </p>
                  <h3 className="text-5xl lg:text-6xl font-black text-white tracking-tighter">
                    ₹ {(walletData?.syncedBalance || 0).toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* Box 2: Quick Actions */}
              <div className="lg:col-span-4 bg-gray-900/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-center gap-4 shadow-xl">
                <p className="text-gray-400 font-semibold tracking-wider uppercase text-sm mb-1">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setIsDepositOpen(true)} className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020817] p-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Plus className="w-4 h-4" /> Deposit
                  </button>
                  <button onClick={() => setIsTransferOpen(true)} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-xl font-bold transition-all">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 p-3 rounded-xl font-bold transition-all w-full">
                  <Zap className="w-4 h-4 text-emerald-400" /> App Sync Ready
                </button>
              </div>

              {/* Box 3: Virtual Debit Card */}
              <div className="lg:col-span-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[50px]"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-[40px]"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <CreditCard className="w-7 h-7 text-emerald-400" />
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-red-500/80 mix-blend-screen"></div>
                    <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-screen -ml-3"></div>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] tracking-[0.2em] mb-1">CARD NUMBER</p>
                  <p className="text-lg font-mono text-white tracking-[0.15em] mb-4">
                    {walletData?.cardNumber || "---- ---- ---- ----"}
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-[10px] tracking-wider mb-1">CARDHOLDER</p>
                      <p className="font-bold text-white uppercase text-sm tracking-wider">{name || 'ADMIN USER'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[10px] tracking-wider mb-1">EXP</p>
                      <p className="font-bold text-white text-sm tracking-wider">{walletData?.cardExpiry || "--/--"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 4: Chart Area */}
              <div className="lg:col-span-8 bg-gray-900/40 border border-white/5 rounded-3xl p-8 shadow-xl h-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-emerald-400 font-semibold tracking-wider uppercase text-sm">Growth Overview</p>
                  <Activity className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-grow w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Box 5: Transactions Sidebar */}
              <div className="lg:col-span-4 bg-gray-900/40 border border-white/5 rounded-3xl p-8 flex flex-col h-[350px] shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white">Global Ledger</h3>
                  <button className="text-emerald-400 text-xs font-semibold hover:underline">Live Feed</button>
                </div>
                
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {transactions?.length === 0 && (
                    <div className="text-gray-500 text-center py-10 text-sm">No transactions synced yet.</div>
                  )}
                  {transactions?.map((tx, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={tx._id || tx.clientTxId || i} 
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1 break-all max-w-[100px]" title={tx.title}>{tx.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <span className={`font-black text-sm tracking-tight ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </Show>
      </main>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Deposit Funds</h3>
            <p className="text-gray-400 mb-6">Add virtual funds to your central bank ledger.</p>
            <input 
              type="number" 
              placeholder="Amount (e.g. 5000)" 
              value={depositAmount} 
              onChange={e => setDepositAmount(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-xl mb-6 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-4">
              <button onClick={() => setIsDepositOpen(false)} className="flex-1 py-3 text-gray-400 hover:text-white font-bold">Cancel</button>
              <button onClick={handleDeposit} disabled={loading} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                {loading ? 'Processing...' : 'Confirm Deposit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Send Online</h3>
            <p className="text-gray-400 mb-6">Instantly transfer funds to another Web Bank user.</p>
            <input 
              type="email" 
              placeholder="Recipient Email" 
              value={transferEmail} 
              onChange={e => setTransferEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white mb-4 focus:outline-none focus:border-emerald-500"
            />
            <input 
              type="number" 
              placeholder="Amount (₹)" 
              value={transferAmount} 
              onChange={e => setTransferAmount(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-xl mb-6 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-4">
              <button onClick={() => setIsTransferOpen(false)} className="flex-1 py-3 text-gray-400 hover:text-white font-bold">Cancel</button>
              <button onClick={handleTransfer} disabled={loading} className="flex-1 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-bold">
                {loading ? 'Sending...' : 'Send Money'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setSelectedTx(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg ${selectedTx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {selectedTx.type === 'credit' ? <ArrowDownRight className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1 text-center">{selectedTx.title}</h3>
            <p className="text-gray-400 mb-8 text-center text-sm">{new Date(selectedTx.timestamp).toLocaleString()}</p>
            
            <div className="space-y-4 bg-black/30 rounded-xl p-5 border border-white/5 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Status</span>
                <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-md">Completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Amount</span>
                <span className={`font-black text-xl tracking-tight ${selectedTx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                  {selectedTx.type === 'credit' ? '+' : '-'} ₹{selectedTx.amount}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-gray-500 text-sm font-medium">Transaction ID</span>
                <span className="text-gray-400 text-[10px] font-mono line-clamp-1 break-all">{selectedTx.clientTxId || selectedTx._id}</span>
              </div>
            </div>
            
            <button onClick={() => setSelectedTx(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all">
              Close Details
            </button>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
