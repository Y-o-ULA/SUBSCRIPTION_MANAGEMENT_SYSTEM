import { useState, useEffect } from 'react';
import { fetchInvoices } from '../../api/invoices';
import Table from '../../components/ui/Table';
import { FileText, Search, Download, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search,   setSearch]   = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setInvoices(await fetchInvoices({ limit: 150 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const badge = (status, isOverdue) => {
    if (isOverdue) return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
        <AlertTriangle size={11} /> Overdue
      </span>
    );
    if (status === 'Paid') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 size={11} /> Paid
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
        <Clock size={11} /> {status}
      </span>
    );
  };

  const filtered = invoices.filter(i => {
    const statusOk = statusFilter === 'All'
      || (statusFilter === 'Overdue' && i.is_overdue)
      || (!i.is_overdue && i.status === statusFilter);
    const q = search.toLowerCase();
    const searchOk = i.number?.toLowerCase().includes(q) || i.customer_name?.toLowerCase().includes(q);
    return statusOk && searchOk;
  });

  const columns = [
    {
      header: 'Invoice #',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText size={14} />
          </div>
          <span className="font-bold text-slate-900">{r.number}</span>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-800">{r.customer_name || '—'}</p>
        </div>
      )
    },
    {
      header: 'Period / Due',
      render: (r) => (
        <div>
          <p className="text-slate-700 font-medium text-xs">{r.billing_period_start}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            Due: {r.due_date}
            {r.days_overdue > 0 && <span className="text-rose-500 ml-1">+{r.days_overdue}d</span>}
          </p>
        </div>
      )
    },
    {
      header: 'Total / Balance',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 font-mono text-xs">₹{Number(r.total || 0).toLocaleString()}</span>
          {r.balance > 0 && (
            <p className="text-[10px] text-rose-500 font-mono">₹{Number(r.balance).toLocaleString()} outstanding</p>
          )}
        </div>
      )
    },
    { header: 'Status', render: (r) => badge(r.status, r.is_overdue) },
    {
      header: 'Receipt',
      render: (r) => (
        <button onClick={() => navigate(`/portal/invoice/${r.id}`)}
          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer">
          <Download size={13} /> View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={22} className="text-indigo-600" /> Generated Invoices
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Tax invoices from the billing engine — {invoices.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white/70 backdrop-blur-md rounded-xl border border-white/80">
            {['All', 'Paid', 'Confirmed', 'Overdue'].map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${statusFilter === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
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
      <Table columns={columns} data={filtered} loading={loading} emptyMessage="No invoices generated yet — run the Billing Engine." />
    </div>
  );
}
