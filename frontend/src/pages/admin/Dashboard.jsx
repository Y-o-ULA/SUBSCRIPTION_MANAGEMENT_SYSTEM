import { useEffect, useState } from 'react';
import { fetchDashboardSummary, fetchMonthlyRevenue } from '../../api/dashboard';
import RevenueChart from '../../components/charts/RevenueChart';
import {
  TrendingUp, Users, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight, Activity, DollarSign, Zap
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summary, revenue] = await Promise.all([
          fetchDashboardSummary(),
          fetchMonthlyRevenue(),
        ]);
        setMetrics(summary);
        setChartData(revenue);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const m = metrics ?? {};

  const kpis = [
    {
      label: 'Monthly Recurring Revenue',
      value: `₹${Number(m.mrr ?? 0).toLocaleString()}`,
      sub:   `Projected ARR: ₹${(Number(m.mrr ?? 0) * 12 / 100000).toFixed(1)}L`,
      badge: '+14.2%',
      badgeColor: 'text-emerald-600 bg-emerald-50',
      icon:  DollarSign,
      iconBg: 'bg-indigo-50 text-indigo-600',
      glow:  'bg-indigo-500/10 group-hover:bg-indigo-500/20',
      hover: 'hover:shadow-indigo-500/10 hover:border-indigo-200',
      trend: 'up',
    },
    {
      label: 'Active Subscriptions',
      value: Number(m.active_subscriptions ?? 0).toLocaleString(),
      sub:   `Renewals in 7 days: ${m.renewals_next_7_days ?? 0}`,
      badge: '78% Ret.',
      badgeColor: 'text-purple-600 bg-purple-50',
      icon:  Users,
      iconBg: 'bg-purple-50 text-purple-600',
      glow:  'bg-purple-500/10 group-hover:bg-purple-500/20',
      hover: 'hover:shadow-purple-500/10 hover:border-purple-200',
      trend: 'up',
    },
    {
      label: 'Overdue Outstanding',
      value: `₹${Number(m.overdue_amount ?? 0).toLocaleString()}`,
      sub:   `${m.overdue_invoices ?? 0} invoices past due date`,
      badge: '2.4% Churn',
      badgeColor: 'text-rose-600 bg-rose-50',
      icon:  AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      glow:  'bg-rose-500/10 group-hover:bg-rose-500/20',
      hover: 'hover:shadow-rose-500/10 hover:border-rose-200',
      trend: 'down',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Connecting to Supabase…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          ⚠️ Supabase error: {error} — check your .env credentials or RLS policies.
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map(({ label, value, sub, badge, badgeColor, icon: Icon, iconBg, glow, hover, trend }) => (
          <div
            key={label}
            className={`relative group overflow-hidden rounded-3xl p-6 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] ${hover} transition-all duration-300`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${glow} transition-all pointer-events-none`} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center border border-white/50 shadow-xs`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {badge}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Activity size={13} className="text-indigo-500" />
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <div className="rounded-3xl p-6 bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 rounded-full bg-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Revenue Growth Dynamics</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Zap size={11} className="inline mr-1" />
              Live from Supabase
            </span>
          </div>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue Collected', value: `₹${Number(m.revenue_collected ?? 0).toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Outstanding Balance', value: `₹${Number(m.outstanding_amount ?? 0).toLocaleString()}`, color: 'text-amber-600' },
          { label: 'Ready to Bill Today', value: m.ready_to_bill ?? 0, color: 'text-indigo-600' },
          { label: 'Overdue Invoices', value: m.overdue_invoices ?? 0, color: 'text-rose-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 bg-white/70 backdrop-blur-xl border border-white/80 text-center">
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
