import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/utils';
import { Shield, Clock, CheckCircle2, XCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showRecentOnly, setShowRecentOnly] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);
      setLoading(false);
    }, (error) => {
      console.error("Signal stream failed:", error);
      setLoading(false);
      setMessage({ text: `Signal stream error: ${error.message}`, type: 'error' });
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleStatusUpdate = async (tx: Transaction, newStatus: 'completed' | 'failed') => {
    try {
      await updateDoc(doc(db, 'transactions', tx.id), {
        status: newStatus
      });

      // Notify the user
      await addDoc(collection(db, 'notifications'), {
        userId: tx.userId,
        title: newStatus === 'completed' ? 'Payout Success' : 'Payout Failed',
        message: newStatus === 'completed' 
          ? `Your payout of ${formatCurrency(tx.amount)} has been processed.`
          : `Your payout of ${formatCurrency(tx.amount)} could not be processed. Please check your PayPal email.`,
        type: 'payout',
        read: false,
        link: '/mpp',
        createdAt: new Date().toISOString()
      });
      setMessage({ text: `Signal updated to ${newStatus}`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.code === 'permission-denied' ? 'Permission Denied: Admin override failed.' : `Update failed: ${err.message || 'Unknown'}`;
      setMessage({ text: errorMsg, type: 'error' });
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${tx.id}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Shield className="h-20 w-20 text-red-500/20 mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter">Access Forbidden</h1>
        <p className="text-neutral-500 mt-2">Only system administrators can access this quadrant.</p>
      </div>
    );
  }

  const filteredTxs = transactions.filter(tx => {
    const isStatusMatch = filter === 'all' ? true : tx.status === filter;
    if (!showRecentOnly) return isStatusMatch;

    const txDate = new Date(tx.createdAt);
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    return isStatusMatch && txDate > twentyFourHoursAgo;
  });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-purple-500">System Command</h1>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-white/40">Manual payout verification and signal management</span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-purple-500/80 font-mono italic">{user?.email}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            {/* Maintenance buttons removed at user request */}
          </div>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-900 border border-purple-500/50 text-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
          <Shield className="h-8 w-8" />
        </div>
      </header>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-purple-600 text-white mpp-glow" : "bg-neutral-900 text-neutral-500 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold",
                  message.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowRecentOnly(!showRecentOnly)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
            showRecentOnly ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-white/40"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {showRecentOnly ? "Showing Recent (24h)" : "Showing All Signal History"}
        </button>
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/20 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-neutral-900/50">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Date</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">User UID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">PayPal Email</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            <AnimatePresence>
              {filteredTxs.map((tx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="p-6">
                    <p className="text-xs font-mono">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-neutral-600">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-mono truncate w-32 cursor-help" title={tx.userId}>{tx.userId}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-white">{formatCurrency(tx.amount)}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-neutral-300">{tx.paypalEmail}</p>
                      <button 
                        onClick={() => window.open(`https://www.paypal.com/payouts/dashboard`, '_blank')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open PayPal Dashboard"
                      >
                        <ExternalLink className="h-3 w-3 text-purple-500" />
                      </button>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                      tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      'bg-red-500/10 text-red-500'
                    )}>
                      {tx.status === 'pending' ? <Clock className="h-3 w-3" /> :
                       tx.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> :
                       <XCircle className="h-3 w-3" />}
                      {tx.status}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {tx.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(tx, 'completed')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                            title="Approve Payout"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(tx, 'failed')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                            title="Reject Payout"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredTxs.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">No transmissions in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
