import { useState, useEffect } from 'react';
import { fetchProducts, createProduct } from '../../api/products';
import Table from '../../components/ui/Table';
import { Package, Plus, Search } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [formData, setFormData] = useState({
    name: '', type: 'Software', sales_price: '', cost_price: '', notes: ''
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
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
      await createProduct(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'Software', sales_price: '', cost_price: '', notes: '' });
      await load();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Product',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package size={16} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{r.name}</p>
            <p className="text-[11px] text-slate-400">{r.notes || '—'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          {r.type || 'Software'}
        </span>
      )
    },
    {
      header: 'Sales Price',
      render: (r) => (
        <span className="font-bold text-indigo-600 font-mono text-xs">
          ₹{Number(r.sales_price || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Cost Price',
      render: (r) => (
        <span className="text-slate-500 font-mono text-xs">
          ₹{Number(r.cost_price || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Variants',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.variants?.length > 0
            ? r.variants.map((v, i) => (
                <span key={i} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md border border-purple-100">
                  {v.value}
                </span>
              ))
            : <span className="text-slate-400 text-[11px]">Base only</span>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={22} className="text-indigo-600" /> Product Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Master software items, add-ons, and services</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search products…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 border border-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          ⚠️ {error}
        </div>
      )}

      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No products yet — click Add Product to create one." />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm">Create New Product</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
                <input required placeholder="e.g. Enterprise CRM"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sales Price (₹)</label>
                  <input type="number" required placeholder="1000"
                    value={formData.sales_price} onChange={e => setFormData({ ...formData, sales_price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cost Price (₹)</label>
                <input type="number" placeholder="400"
                  value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes</label>
                <textarea rows={2} placeholder="Brief description"
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
