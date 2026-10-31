import { useState, useEffect } from 'react';
import { fetchPlans, createPlan, fetchTaxes } from '../../api/plans';
import { fetchProducts } from '../../api/products';
import Table from '../../components/ui/Table';
import { Tag, Plus, Search } from 'lucide-react';

export default function Plans() {
  const [plans,     setPlans]     = useState([]);
  const [products,  setProducts]  = useState([]);
  const [taxes,     setTaxes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [formData,  setFormData]  = useState({
    product_id: '', name: '', price: '', billing_interval: 'monthly',
    min_qty: 1, renewable: true, pausable: false, auto_close: false, tax_id: ''
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, pr, tx] = await Promise.all([fetchPlans(), fetchProducts(), fetchTaxes()]);
      setPlans(p);
      setProducts(pr);
      setTaxes(tx);
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
      await createPlan({
        product_id:       formData.product_id || null,
        name:             formData.name,
        price:            parseFloat(formData.price) || 0,
        billing_interval: formData.billing_interval,
        min_qty:          parseInt(formData.min_qty) || 1,
        renewable:        formData.renewable,
        pausable:         formData.pausable,
        auto_close:       formData.auto_close,
        tax_id:           formData.tax_id || null,
      });
      setShowModal(false);
      setFormData({ product_id: '', name: '', price: '', billing_interval: 'monthly', min_qty: 1, renewable: true, pausable: false, auto_close: false, tax_id: '' });
      await load();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = plans.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Plan',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Tag size={16} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{r.name}</p>
            <p className="text-[11px] text-indigo-600 font-medium">Product: {r.product?.name || '—'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Cadence',
      render: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
          {r.billing_interval}
        </span>
      )
    },
    {
      header: 'Price',
      render: (r) => (
        <span className="font-bold text-slate-900 font-mono text-xs">
          ₹{Number(r.price || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Tax',
      render: (r) => (
        <span className="text-[11px] text-slate-500">{r.tax?.name || 'No tax'}</span>
      )
    },
    {
      header: 'Min Qty',
      render: (r) => (
        <span className="text-slate-600 font-mono text-xs">{r.min_qty} seats</span>
      )
    },
    {
      header: 'Policies',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-[10px]">
          {r.renewable && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-semibold">Auto-Renew</span>}
          {r.pausable  && <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-semibold">Pausable</span>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag size={22} className="text-purple-600" /> Pricing Plans & Tiers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Recurring billing cycles and frequency templates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search plans…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 border border-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 cursor-pointer">
            <Plus size={14} /> Add Plan
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">⚠️ {error}</div>}
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No plans yet." />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Create New Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Linked Product</label>
                <select required value={formData.product_id} onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Plan Name</label>
                <input required placeholder="e.g. Pro Monthly" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Billing Cadence</label>
                  <select value={formData.billing_interval} onChange={e => setFormData({ ...formData, billing_interval: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹)</label>
                  <input type="number" required placeholder="1200" value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tax Rate</label>
                <select value={formData.tax_id} onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">No Tax</option>
                  {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4 pt-1">
                {[['renewable', 'Auto-Renewable'], ['pausable', 'Pausable'], ['auto_close', 'Auto-Close']].map(([field, label]) => (
                  <label key={field} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={formData[field]}
                      onChange={e => setFormData({ ...formData, [field]: e.target.checked })}
                      className="rounded text-purple-600" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
