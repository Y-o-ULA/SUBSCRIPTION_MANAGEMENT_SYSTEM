import { useState, useEffect } from 'react';
import { fetchPayments, recordPayment, fetchUnpaidInvoices } from '../../api/payments';
import Table from '../../components/ui/Table';
import { CreditCard, Plus, Search, CheckCircle2 } from 'lucide-react';

export default function Payments() {
  const [payments,       setPayments]       = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [saving,         setSaving]         = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [search,         setSearch]         = useState('');
  const [formData,       setFormData]       = useState({
    invoice_id: '', method: 'UPI', amount: '', note: ''
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, unpaid] = await Promise.all([fetchPayments(), fetchUnpaidInvoices()]);
      setPayments(p);
      setUnpaidInvoices(unpaid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordPayment({
        invoice_id: formData.invoice_id,
        method:     formData.method,
        amount:     parseFloat(formData.amount) || 0,
        note:       formData.note || null,
      });
      setShowModal(false);
      setFormData({ invoice_id: '', method: 'UPI', amount: '', note: '' });
      await load();
    } catch (err) {
      alert(`Payment error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      p.invoice?.number?.toLowerCase().includes(q) ||
      p.method?.toLowerCase().includes(q) ||
      p.invoice?.customer?.name?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Invoice Settled',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <span className="font-bold text-slate-900">{r.invoice?.number || '—'}</span>
            <p className="text-[10px] text-slate-400">{r.invoice?.customer?.name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Mode',
      render: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {r.method}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (r) => (
        <span className="font-bold text-emerald-600 font-mono text-xs">
          ₹{Number(r.amount || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Paid At',
      render: (r) => (
        <span className="text-slate-500 font-mono text-xs">
          {r.paid_at ? new Date(r.paid_at).toLocaleDateString('en-IN') : 'Today'}
        </span>
      )
    },
    {
      header: 'Reference',
      render: (r) => (
        <span className="text-slate-400 text-xs truncate max-w-xs block">{r.note || '—'}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={22} className="text-emerald-600" /> Payment Collections
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Live ledger of UPI, Card & Bank payments — {payments.length} records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 border border-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer">
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">⚠️ {error}</div>}
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No payments captured yet." />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Record Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Invoice to Settle</label>
                <select required value={formData.invoice_id}
                  onChange={e => {
                    const inv = unpaidInvoices.find(i => i.id === e.target.value);
                    setFormData({ ...formData, invoice_id: e.target.value, amount: inv ? String(inv.total) : formData.amount });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select pending invoice…</option>
                  {unpaidInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} — {inv.customer?.name} (₹{inv.total})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (₹)</label>
                  <input type="number" required placeholder="1180" value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reference / Note</label>
                <input placeholder="UTR or transaction ID" value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : 'Confirm Settlement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
