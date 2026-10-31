import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  LogOut,
  Zap,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Portal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomerData() {
      setLoading(true);
      try {
        // Fetch invoices
        const { data: invData } = await supabase
          .from('invoices')
          .select(`
            id,
            number,
            billing_period_start,
            billing_period_end,
            total,
            due_date,
            status
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (invData && invData.length > 0) {
          setInvoices(invData);
        } else {
          // Mockup fallback
          setInvoices([
            { id: '1', number: 'INV-5001', billing_period_start: '2026-10-01', total: 1180, status: 'Paid', due_date: '2026-10-15' },
            { id: '2', number: 'INV-5002', billing_period_start: '2026-09-01', total: 1180, status: 'Paid', due_date: '2026-09-15' },
            { id: '3', number: 'INV-5003', billing_period_start: '2026-08-01', total: 1180, status: 'Confirmed', due_date: '2026-08-15' },
          ]);
        }

        // Fetch user subscriptions
        const { data: subData } = await supabase
          .from('subscriptions')
          .select(`
            id,
            number,
            status,
            next_billing_date,
            plan:plans(name, price, billing_interval)
          `)
          .limit(5);

        if (subData && subData.length > 0) {
          setSubscriptions(subData);
        } else {
          setSubscriptions([
            {
              id: '1',
              number: 'SUB-1001',
              status: 'Active',
              next_billing_date: '2026-11-01',
              plan: { name: 'Business Pro Monthly', price: 1000, billing_interval: 'monthly' }
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading customer portal:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen mesh-gradient-bg text-slate-800 antialiased selection:bg-purple-500 selection:text-white pb-12">
      {/* ── Ambient Glow Elements ── */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-400/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-400/15 blur-[140px] pointer-events-none" />

      {/* ── Top Navbar ── */}
      <nav className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/80 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Zap size={16} className="fill-current" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">
            Customer Billing Portal
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-100">
            Client View
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden sm:inline">
            {user?.email || 'customer@example.com'}
          </span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main Portal Body ── */}
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900/90 text-white shadow-xl backdrop-blur-xl border border-white/10">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              Subscription Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              Manage Your Services & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Real-time ledger of your subscribed software packages, next renewal schedules, and verifiable tax invoices.
            </p>
          </div>
        </div>

        {/* Current Subscriptions Section */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-600" />
            Active Subscriptions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map(sub => (
              <div 
                key={sub.id}
                className="rounded-2xl p-5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{sub.number}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {sub.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mt-2">
                    {sub.plan?.name || 'Enterprise Suite'}
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    ₹{sub.plan?.price?.toLocaleString()} / {sub.plan?.billing_interval || 'month'}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={13} />
                    Next: {sub.next_billing_date || 'Auto-renew active'}
                  </span>
                  <span className="text-emerald-600 font-medium">Auto-Debit On</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices History Section */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            Invoice History & Receipts
          </h2>

          <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">Invoice #</th>
                  <th className="py-3 px-5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">Billing Period</th>
                  <th className="py-3 px-5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">Total</th>
                  <th className="py-3 px-5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="py-3 px-5 text-slate-400 font-bold uppercase tracking-wider text-[11px] text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{inv.number}</td>
                    <td className="py-3.5 px-5 text-slate-500">{inv.billing_period_start}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">₹{inv.total?.toLocaleString()}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 cursor-pointer">
                        <Download size={13} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
