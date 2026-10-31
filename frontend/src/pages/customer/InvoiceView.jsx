import { useEffect, useState } from 'react';
import { fetchInvoiceById } from '../../api/invoices';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setInvoice(await fetchInvoiceById(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf7ee]">
        <div className="w-8 h-8 border-3 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf7ee] gap-4">
        <p className="text-rose-600 font-bold text-sm">Invoice not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs text-black underline cursor-pointer font-bold">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7ee] py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between print:hidden">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#171614] hover:bg-neutral-800 text-[#f59e0b] text-xs font-bold shadow-xs cursor-pointer">
            <Printer size={15} /> Print / PDF
          </button>
        </div>

        {/* Invoice paper */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-[#ebdcc9] space-y-6 print:shadow-none print:border-none print:rounded-none">
          <div className="flex items-center justify-between border-b border-[#ebdcc9] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-black flex items-center justify-center font-black text-sm">B</div>
                <h1 className="font-black text-[#171614] text-lg">BrightLoop Subscriptions</h1>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Official GST Tax Invoice</p>
            </div>
            <div className="text-right">
              <span className="font-black font-mono text-base text-neutral-900 block">{invoice.number}</span>
              {invoice.status === 'Paid'
                ? <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#171614] text-[#f59e0b]"><CheckCircle2 size={11} />Paid</span>
                : <span className="inline-flex items-center gap-1 mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#fbf7ee] text-black border border-[#ebdcc9]"><Clock size={11} />{invoice.status}</span>
              }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-black text-neutral-400 uppercase tracking-wider text-[10px]">Billed To</p>
              <p className="font-bold text-neutral-900 text-sm mt-1">{invoice.customer?.name}</p>
              <p className="text-neutral-600 font-medium">{invoice.customer?.company}</p>
              <p className="text-neutral-400">{invoice.customer?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-neutral-400 uppercase tracking-wider text-[10px]">Invoice Details</p>
              <p className="text-neutral-600 mt-1 font-medium">Period: {invoice.billing_period_start} → {invoice.billing_period_end}</p>
              <p className="text-neutral-600 font-medium">Due: <span className="font-bold text-black">{invoice.due_date}</span></p>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ebdcc9] text-neutral-400 font-bold uppercase text-[10px]">
                <th className="py-2.5">Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Tax %</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ebe0] text-neutral-800 font-medium">
              {(invoice.lines ?? []).map((line, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-semibold">{line.description}</td>
                  <td className="py-3 text-center font-mono">{line.quantity}</td>
                  <td className="py-3 text-right font-mono">₹{Number(line.unit_price || 0).toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{line.tax_rate ?? 0}%</td>
                  <td className="py-3 text-right font-mono font-bold text-black">₹{Number(line.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="border-t border-[#ebdcc9] pt-4 flex justify-end">
            <div className="w-60 space-y-1.5 text-xs text-neutral-700 font-medium">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">₹{Number(invoice.subtotal ?? 0).toLocaleString()}</span></div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span><span className="font-mono">-₹{Number(invoice.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between"><span>GST (18%):</span><span className="font-mono">₹{Number(invoice.tax_amount ?? 0).toLocaleString()}</span></div>
              <div className="flex justify-between font-black text-black text-sm border-t border-[#ebdcc9] pt-2">
                <span>Total:</span><span className="font-mono text-[#d97706]">₹{Number(invoice.total ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-neutral-400 border-t border-[#ebdcc9] pt-4 font-medium">
            BrightLoop Subscription Platform · support@brightloop.io
          </p>
        </div>
      </div>
    </div>
  );
}
