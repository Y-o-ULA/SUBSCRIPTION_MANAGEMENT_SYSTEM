import { useState, useEffect } from 'react';
import { fetchDiscounts, createDiscount, toggleDiscount } from '../../api/products';
import Table from '../../components/ui/Table';
import { Percent, Plus, Search, CheckCircle2, XCircle } from 'lucide-react';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [formData,  setFormData]  = useState({
    name: '', type: 'percent', value: '', min_amount: 0, min_qty: 0, usage_limit: ''
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setDiscounts(await fetchDiscounts());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDiscount({
        name:        formData.name,
        type:        formData.type,
        value:       parseFloat(formData.value) || 0,
        min_amount:  parseFloat(formData.min_amount) || 0,
        min_qty:     parseInt(formData.min_qty) || 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      });
      setShowModal(false);
      setFormData({ name: '', type: 'percent', value: '', min_amount: 0, min_qty: 0, usage_limit: '' });
      await load();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, active) => {
    try {
      await toggleDiscount(id, !active);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = discounts.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Campaign',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
            <Percent size={14} />
          </div>
          <div>
            <span className="font-bold text-slate-900">{r.name}</span>
            <p className="text-[10px] text-slate-400">Min order: ₹{r.min_amount || 0}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Value',
      render: (r) => (
        <span className="font-bold text-pink-600 font-mono text-xs">
          {r.type === 'percent' ? `${r.value}% OFF` : `₹${r.value} FLAT`}
        </span>
      )
    },
    {
      header: 'Redeemed / Limit',
      render: (r) => (
        <span className="text-slate-600 font-mono text-xs">
          {r.used_count ?? 0} {r.usage_limit ? `/ ${r.usage_limit}` : '/ ∞'}
        </span>
      )
    },
    {
      header: 'Min Seats',
      render: (r) => (
        <span className="text-[11px] text-slate-500">
          {r.min_qty > 0 ? `${r.min_qty}+` : 'None'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (r) => (
        <button onClick={() => handleToggle(r.id, r.active)}
          className="cursor-pointer">
          {r.active
            ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                <CheckCircle2 size={11} /> Active
              </span>
            : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                <XCircle size={11} /> Inactive
              </span>
          }
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Percent size={22} className="text-pink-600" /> Coupons & Discounts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Auto-applied during billing runs — click status to toggle</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 border border-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 shadow-md shadow-pink-600/20 cursor-pointer">
            <Plus size={14} /> Create Campaign
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">⚠️ {error}</div>}
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No discount rules created yet." />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Create Discount Rule</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Campaign Name</label>
                <input required placeholder="e.g. Diwali 15% OFF" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Value</label>
                  <input type="number" required placeholder="15" value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input type="number" placeholder="0" value={formData.min_amount}
                    onChange={e => setFormData({ ...formData, min_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Redemptions</label>
                  <input type="number" placeholder="Unlimited" value={formData.usage_limit}
                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
