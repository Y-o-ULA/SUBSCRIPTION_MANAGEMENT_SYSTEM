import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  FileText,
  CreditCard,
  Percent,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',      icon: Package,          label: 'Products'  },
  { to: '/plans',         icon: Tag,              label: 'Plans'     },
  { to: '/subscriptions', icon: Users,            label: 'Subscriptions' },
  { to: '/invoices',      icon: FileText,         label: 'Invoices'  },
  { to: '/payments',      icon: CreditCard,       label: 'Payments'  },
  { to: '/discounts',     icon: Percent,          label: 'Discounts' },
  { to: '/billing-run',   icon: Zap,              label: 'Billing Run' },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const sidebarW = collapsed ? 'w-20' : 'w-64';

  return (
    <div className="flex min-h-screen relative bg-[#fbf7ee] text-[#171614] antialiased overflow-x-hidden selection:bg-[#f59e0b] selection:text-black">
      
      {/* ── Sidebar: Pitch Dark & Amber Accents (Matches Jenny Scott reference) ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#171614] text-white border-r border-[#262420]
          shadow-xl transition-all duration-300 ease-in-out
          ${sidebarW}
        `}
      >
        {/* Brand Bar */}
        <div className={`flex items-center h-18 px-5 border-b border-[#262420] shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f59e0b] flex items-center justify-center shadow-md text-black font-extrabold text-base shrink-0">
              B
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  BrightLoop<span className="text-[#f59e0b]">.</span>
                </span>
                <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider block">
                  Admin Suite
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-5 space-y-1.5 px-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-150 group
                 ${isActive
                   ? 'bg-[#f59e0b] text-black shadow-md'
                   : 'text-neutral-400 hover:bg-[#262420] hover:text-white'
                 }
                 ${collapsed ? 'justify-center !px-0' : ''}
                `
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={17} 
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-black' : 'text-neutral-400 group-hover:text-[#f59e0b] group-hover:scale-110'
                    }`} 
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}

          {/* Quick link to Customer Portal */}
          <div className="pt-4 mt-3 border-t border-[#262420]">
            <NavLink
              to="/portal"
              target="_blank"
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold text-neutral-400 hover:bg-[#262420] hover:text-[#f59e0b] transition-colors ${
                collapsed ? 'justify-center !px-0' : ''
              }`}
              title="Open Customer Portal"
            >
              <ExternalLink size={16} className="text-[#f59e0b] shrink-0" />
              {!collapsed && <span>Customer Portal</span>}
            </NavLink>
          </div>
        </nav>

        {/* User Card & Sign-out */}
        <div className="p-3 border-t border-[#262420] bg-[#12110f]">
          {!collapsed && (
            <div className="mb-2 px-3 py-2 rounded-2xl bg-[#1e1c18] border border-[#2e2a22] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-black font-extrabold text-xs flex items-center justify-center shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate flex-1">
                <p className="text-[11px] font-bold text-white truncate">{user?.email || 'admin@brightloop.io'}</p>
                <p className="text-[9px] text-[#f59e0b] font-semibold">● Connected</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 rounded-full px-3 py-2 text-xs font-bold
              text-neutral-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all cursor-pointer
              ${collapsed ? 'justify-center !px-0' : ''}
            `}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="
            absolute -right-3 top-6 w-6 h-6 rounded-full
            bg-[#f59e0b] text-black border border-black shadow-md
            flex items-center justify-center
            hover:scale-110 transition-all z-50 cursor-pointer font-bold
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={13} strokeWidth={3} />
            : <ChevronLeft  size={13} strokeWidth={3} />
          }
        </button>
      </aside>

      {/* ── Main Canvas ── */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'ml-20' : 'ml-64'}`}>
        
        {/* Topbar in Warm Cream */}
        <header className="sticky top-0 z-30 h-16 px-8 flex items-center justify-between bg-[#fbf7ee]/90 backdrop-blur-md border-b border-[#ebdcc9] shadow-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#171614] text-[#f59e0b]">
              <Sparkles size={12} />
              BrightLoop v2.4
            </span>
            <span className="text-xs text-[#ebdcc9]">|</span>
            <span className="text-xs font-extrabold text-neutral-600 tracking-wider uppercase">
              Subscription Management Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-black bg-white px-3 py-1 rounded-full border border-[#ebdcc9] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              Supabase Live
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
}
