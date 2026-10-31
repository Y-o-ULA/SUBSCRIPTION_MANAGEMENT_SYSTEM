import { useState, useEffect } from 'react';
import { fetchSubscriptions } from '../../api/subscriptions';
import Table from '../../components/ui/Table';
import { Users, Search, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export default function Subscriptions() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('All');
  const [search,  setSearch]  = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSubs(await fetchSubscriptions({ limit: 200 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const badge = (status) => {
    const map = {
      Active:    'bg-emerald-50 text-emerald-600 border-emerald-200',
      Closed:    'bg-rose-50    text-rose-600    border-rose-200',
      Draft:     'bg-slate-100  text-slate-600   border-slate-200',
      Quotation: 'bg-amber-50   text-amber-600   border-amber-200',
      Confirmed: 'bg-blue-50    text-blue-600    border-blue-200',
    };
    const icons = {
      Active: <CheckCircle2 size={11} />,
      Closed: <XCircle size={11} />,
      Draft:  <Clock size={11} />,
      Quotation: <AlertCircle size={11} />,
      Confirmed: <AlertCircle size={11} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] ?? map.Draft}`}>
        {icons[status]} {status}
      </span>
    );
  };

  const filtered = subs.filter(s => {
    const matchFilter = filter === 'All' || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      s.number?.toLowerCase().includes(q) ||
      s.customer?.name?.toLowerCase().includes(q) ||
      s.customer?.company?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const columns = [
    {
      header: 'Subscription #',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">#</div>
          <span className="font-bold text-slate-900">{r.number}</span>
        </div>
      )
    },
    {
      header: 'Customer & Company',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.customer?.name || 'N/A'}</p>
          <p className="text-[10px] text-slate-400">{r.customer?.company || r.customer?.email}</p>
        </div>
      )
    },
    {
      header: 'Plan & Billing',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800">{r.plan?.name || '—'}</p>
          <p className="text-[10px] text-indigo-600 font-semibold">
            ₹{Number(r.plan?.price || 0).toLocaleString()} / {r.plan?.billing_interval || 'mo'}
          </p>
        </div>
      )
    },
    { header: 'Status', render: (r) => badge(r.status) },
    {
      header: 'Next Billing',
      render: (r) => (
        <span className="text-slate-500 font-mono text-[11px]">{r.next_billing_date || '—'}</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-indigo-600" /> Subscriptions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time lifecycle management — {subs.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 shadow-xs">
            {['All', 'Active', 'Confirmed', 'Draft', 'Closed'].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 border border-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">⚠️ {error}</div>}
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No subscriptions found." />
    </div>
  );
}
