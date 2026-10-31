import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowUpRight, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  User, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Layers,
  PhoneCall,
  Flame,
  Award
} from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [roleTab, setRoleTab] = useState('admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role) => {
    setRoleTab(role);
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    } else {
      setEmail('customer1@example.com');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      if (roleTab === 'customer') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7ee] text-[#171614] font-sans selection:bg-[#f59e0b] selection:text-black">
      
      {/* ── Top Header Navbar (Matches Jenny Scott design) ── */}
      <header className="max-w-6xl mx-auto pt-6 px-4 sm:px-8">
        <div className="bg-[#171614] text-white rounded-full px-5 py-3 flex items-center justify-between shadow-lg">
          {/* Brand Logo Pill */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-black font-extrabold text-sm shadow-sm">
              B
            </div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
              BrightLoop<span className="text-[#f59e0b]">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-300">
            <a href="#home" className="text-[#f59e0b] hover:text-[#f59e0b] transition-colors">Home</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#plans" className="hover:text-white transition-colors">Plans</a>
            <a href="#solutions" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#reviews" className="hover:text-white transition-colors">Testimonials</a>
          </nav>

          {/* Let's Talk / Access Pill Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRoleChange(roleTab === 'admin' ? 'customer' : 'admin')}
              className="bg-white text-black hover:bg-[#f59e0b] text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>{roleTab === 'admin' ? 'Customer Portal' : 'Admin Console'}</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Hero Section ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-16">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#ebdcc9] text-xs font-semibold text-neutral-800 shadow-xs">
            <Award size={14} className="text-[#f59e0b]" />
            <span>Award-Winning Subscription Engine</span>
          </div>
        </div>

        {/* Hero Big Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-[#171614] tracking-tight leading-tight">
            I'm <span className="text-[#f59e0b]">BrightLoop</span> Subscription
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-medium">
            Automated recurring billing, invoice lifecycles & client portal based in Cloud.
          </p>
        </div>

        {/* ── 2-Column Hero Showcase (Layout from image) ── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 sm:p-12 border border-[#ebdcc9] shadow-sm">
          
          {/* Left Column: Social / Ratings + Auth Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Stamp Badge from reference */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Portal Authentication</span>
                <h2 className="text-2xl font-black text-[#171614]">Direct Portal Access</h2>
              </div>
              <div className="w-16 h-16 stamp-badge text-[9px] text-center leading-tight shadow-md">
                ENTER<br />PORTAL
              </div>
            </div>

            {/* Role Switcher Pill */}
            <div className="grid grid-cols-2 p-1.5 bg-[#fbf7ee] rounded-full border border-[#ebdcc9]">
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  roleTab === 'admin'
                    ? 'bg-[#171614] text-[#f59e0b] shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <ShieldCheck size={14} />
                Admin Console
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  roleTab === 'customer'
                    ? 'bg-[#171614] text-[#f59e0b] shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                <User size={14} />
                Customer Portal
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Direct Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  {roleTab === 'admin' ? 'Administrator Account' : 'Customer Account Email'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder={roleTab === 'admin' ? 'admin@example.com' : 'customer1@example.com'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-xs font-medium rounded-full bg-[#fbf7ee] border border-[#ebdcc9] text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                  Access Key / Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 text-xs font-medium rounded-full bg-[#fbf7ee] border border-[#ebdcc9] text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons mimicking the photo's (Portfolio / Hire Me) dual buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 rounded-full font-bold text-xs bg-[#f59e0b] hover:bg-[#d97706] text-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Entering…</span>
                  ) : (
                    <>
                      <span>Enter {roleTab === 'admin' ? 'Admin Suite' : 'Client Portal'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange(roleTab === 'admin' ? 'customer' : 'admin')}
                  className="py-3 px-6 rounded-full font-bold text-xs bg-white hover:bg-neutral-100 text-black border border-neutral-300 transition-all cursor-pointer"
                >
                  Switch Role
                </button>
              </div>
            </form>

            {/* Reviews Metric (From reference) */}
            <div className="pt-4 border-t border-[#ebdcc9] flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[#171614] flex items-center gap-1">
                  <Star size={14} className="fill-[#f59e0b] text-[#f59e0b]" />
                  <span>350+ Reviews (4.9 of 5)</span>
                </p>
                <p className="text-[11px] text-neutral-500">Evaluated by global enterprise clients</p>
              </div>
              <span className="text-xs font-bold text-[#f59e0b] bg-[#171614] px-3 py-1 rounded-full">
                Active 24/7
              </span>
            </div>

          </div>

          {/* Right Column: Visual Graphic & Tag Cloud (Matches photo badges) */}
          <div className="lg:col-span-6 bg-[#fbf7ee] rounded-2xl p-8 border border-[#ebdcc9] relative flex flex-col justify-between min-h-[380px]">
            
            {/* Quote block matching design */}
            <div className="text-right mb-6">
              <span className="text-2xl text-[#f59e0b] font-serif leading-none">“</span>
              <p className="text-xs font-bold text-neutral-700 italic max-w-xs ml-auto">
                Highly Professional Subscription & Invoicing Automation with Great Simplicity!
              </p>
            </div>

            {/* Center Visual Showcase */}
            <div className="my-auto text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-[#171614] text-[#f59e0b] mx-auto flex items-center justify-center shadow-md">
                <Flame size={36} />
              </div>
              <h3 className="text-lg font-black text-[#171614]">BrightLoop Engine</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Enterprise billing automation, multi-cadence recurring plans, GST invoices, and zero-churn retries.
              </p>
            </div>

            {/* Tag Pills matching the tags in photo (Prototype, Dashboard, Mobile App Design, etc.) */}
            <div className="flex flex-wrap gap-2 justify-center pt-6">
              <span className="tag-pill bg-[#171614] text-white">Automated Recurring</span>
              <span className="tag-pill bg-[#f59e0b] text-black">GST Compliant</span>
              <span className="tag-pill bg-white border border-[#ebdcc9] text-black">Multi-Cadence</span>
              <span className="tag-pill bg-[#171614] text-[#f59e0b]">Supabase Powered</span>
              <span className="tag-pill bg-[#f59e0b] text-black">Live Webhooks</span>
            </div>

          </div>

        </div>

        {/* ── Marquee Ribbon Banner (Design feature from reference: Design * Dashboard * Website Design) ── */}
        <div className="mt-8 rounded-2xl bg-[#171614] text-[#f59e0b] py-3.5 px-6 flex items-center justify-between text-xs font-extrabold uppercase tracking-widest shadow-md">
          <div className="flex items-center gap-3">
            <span>Recurring Billing</span>
            <span className="text-white">✦</span>
            <span>Tax Invoices</span>
            <span className="text-white">✦</span>
            <span>Plan Cadences</span>
            <span className="text-white">✦</span>
            <span>Live Collections</span>
            <span className="text-white">✦</span>
            <span>Client Self-Service</span>
          </div>
          <span className="text-white hidden sm:inline text-[10px]">BrightLoop v2.4</span>
        </div>

        {/* ── Section: Services / Feature Accordions (Matches "How I Bring Ideas to Life" in reference) ── */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d97706]">Platform Features</span>
              <h2 className="text-2xl font-black text-[#171614]">
                How BrightLoop Powers <span className="text-[#f59e0b]">Subscriptions</span>
              </h2>
            </div>
            <button className="px-4 py-2 bg-white border border-[#ebdcc9] rounded-full text-xs font-bold text-black flex items-center gap-2 hover:bg-neutral-50 cursor-pointer">
              <span>View All Capabilities</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Service items styled like the numbered tabs in the uploaded screenshot */}
          <div className="space-y-3">
            
            {/* Item 01 */}
            <div className="bg-white rounded-2xl p-5 border border-[#ebdcc9] flex items-center justify-between hover:border-black transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-[#f59e0b]">01.</span>
                <span className="text-sm font-bold text-black">Product & Multi-Tier Pricing Catalog</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#fbf7ee] flex items-center justify-center">
                <ArrowUpRight size={16} className="text-neutral-700" />
              </div>
            </div>

            {/* Item 02 (Expanded dark card like Website Design in the photo) */}
            <div className="bg-[#171614] text-white rounded-2xl p-6 border border-black shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-[#f59e0b]">02.</span>
                  <h3 className="text-base font-bold text-white">Automated Invoicing & Billing Runs</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-black flex items-center justify-center">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              
              {/* Pills inside the dark item */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold">Scheduled Queues</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold">GST Calculation</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold">PostgreSQL RPC Function</span>
                <span className="px-3 py-1 rounded-full bg-[#f59e0b] text-black text-[11px] font-bold">1-Click Run</span>
              </div>

              <p className="text-xs text-neutral-400 max-w-xl">
                Background Postgres engine processes overdue subscriptions, calculates taxes and coupons, generates numbered tax invoices, and advances billing dates automatically.
              </p>
            </div>

            {/* Item 03 */}
            <div className="bg-white rounded-2xl p-5 border border-[#ebdcc9] flex items-center justify-between hover:border-black transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-[#f59e0b]">03.</span>
                <span className="text-sm font-bold text-black">Payment Settlements (UPI, Card, Bank Transfer)</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#fbf7ee] flex items-center justify-center">
                <ArrowUpRight size={16} className="text-neutral-700" />
              </div>
            </div>

            {/* Item 04 */}
            <div className="bg-white rounded-2xl p-5 border border-[#ebdcc9] flex items-center justify-between hover:border-black transition-all">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-bold text-[#f59e0b]">04.</span>
                <span className="text-sm font-bold text-black">Customer Self-Service Invoicing Portal</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#fbf7ee] flex items-center justify-center">
                <ArrowUpRight size={16} className="text-neutral-700" />
              </div>
            </div>

          </div>

        </div>

        {/* ── Footer ── */}
        <footer className="mt-16 pt-8 border-t border-[#ebdcc9] text-center text-xs text-neutral-500">
          <p className="font-semibold text-neutral-800">
            BrightLoop Subscription Engine · All Rights Reserved
          </p>
          <p className="mt-1">
            Questions? Contact: support@brightloop.io · Powered by Supabase Backend
          </p>
        </footer>

      </main>

    </div>
  );
}
