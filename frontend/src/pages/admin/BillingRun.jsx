import { useState, useEffect } from 'react';
import { fetchBillingQueue } from '../../api/subscriptions';
import { supabase } from '../../lib/supabase';
import Table from '../../components/ui/Table';
import { Zap, Play, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function BillingRun() {
  const [queue,   setQueue]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setQueue(await fetchBillingQueue());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const triggerBillingRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      // Calls the PostgreSQL security-definer function: generate_due_invoices()
      const { data, error: rpcErr } = await supabase.rpc('generate_due_invoices');
      if (rpcErr) throw rpcErr;
      setResult(data);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { header: 'Subscription #', render: (r) => <span className="font-bold text-slate-900">{r.number}</span> },
    { header: 'Customer',       render: (r) => <span className="font-medium text-slate-800">{r.customer_name}</span> },
    {
      header: 'Plan',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.plan_name}</p>
          <span className="text-[10px] uppercase font-bold text-indigo-600">{r.billing_interval}</span>
        </div>
      )
    },
    {
      header: 'Amount Due',
      render: (r) => (
        <span className="font-bold text-slate-900 font-mono text-xs">₹{Number(r.price || 0).toLocaleString()}</span>
      )
    },
    {
      header: 'Due Date',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
          <Clock size={11} /> {r.next_billing_date}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap size={22} className="text-amber-500 fill-amber-500" /> Billing Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {queue.length} subscription{queue.length !== 1 ? 's' : ''} ready to invoice — runs the PostgreSQL RPC <code className="bg-slate-100 px-1 rounded">generate_due_invoices()</code>
          </p>
        </div>
        <button onClick={triggerBillingRun} disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60">
          {running
            ? <><RefreshCw size={14} className="animate-spin" /> Processing…</>
            : <><Play size={14} className="fill-current" /> Execute Billing Run Now</>
          }
        </button>
      </div>

      {result && (
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Billing Run Completed ✓</p>
              <p className="text-[11px] text-emerald-700">
                {result.subscriptions_checked} checked · {result.invoices_created} invoices generated · {result.skipped} skipped (already billed)
              </p>
            </div>
          </div>
          <button onClick={() => setResult(null)} className="text-xs text-emerald-700 font-semibold cursor-pointer">Dismiss</button>
        </div>
      )}

      {error && <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">⚠️ {error}</div>}

      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Due for Invoicing ({queue.length})
        </h2>
        <Table columns={columns} data={queue} loading={loading} emptyMessage="All subscriptions are up to date — nothing in the queue." />
      </div>
    </div>
  );
}
