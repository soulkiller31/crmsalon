import { useEffect, useState, useMemo, useRef } from 'react';
import { Plus, Trash2, Send, RefreshCw, Download, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';

const emptyItem = { description: '', quantity: 1, price: 0 };
const emptyCustomer = { name: '', phone: '', birthday: '', anniversary: '', address: '', gender: '' };

const CATALOGUE = [
  { cat: 'Waxing (Rica)', name: 'Full Body Wax - Rica', price: 2500 },
  { cat: 'Waxing (Rica)', name: 'Full Arms Wax - Rica', price: 400 },
  { cat: 'Waxing (Rica)', name: 'Half Arms Wax - Rica', price: 250 },
  { cat: 'Waxing (Rica)', name: 'Half Legs Wax - Rica', price: 400 },
  { cat: 'Waxing (Rica)', name: 'Full Legs Wax - Rica', price: 600 },
  { cat: 'Waxing (Rica)', name: 'Underarms Wax - Rica', price: 150 },
  { cat: 'Waxing (Rica)', name: 'Face Wax - Rica', price: 500 },
  { cat: 'Waxing (Rica)', name: 'Bikini Wax - Rica', price: 2200 },
  { cat: 'Waxing (Rica)', name: 'Bikini Line - Rica', price: 600 },
  { cat: 'Waxing (Rica)', name: 'Back Wax - Rica', price: 500 },
  { cat: 'Waxing (Rica)', name: 'Stomach Wax - Rica', price: 500 },
  { cat: 'Waxing (Rica)', name: 'Upper Lips Wax - Rica', price: 50 },
  { cat: 'Waxing (Rica)', name: 'Chin Wax - Rica', price: 50 },
  { cat: 'Waxing (Rica)', name: 'Both Side Locks Wax - Rica', price: 200 },
  { cat: 'Waxing (Rica)', name: 'Forehead Wax - Rica', price: 50 },
  { cat: 'Waxing (Rica)', name: 'Brazilian Wax - Rica', price: 3000 },
  { cat: 'Waxing (Honey)', name: 'Full Body Wax - Honey', price: 2000 },
  { cat: 'Waxing (Honey)', name: 'Full Arms Wax - Honey', price: 350 },
  { cat: 'Waxing (Honey)', name: 'Half Arms Wax - Honey', price: 250 },
  { cat: 'Waxing (Honey)', name: 'Half Legs Wax - Honey', price: 400 },
  { cat: 'Waxing (Honey)', name: 'Full Legs Wax - Honey', price: 500 },
  { cat: 'Waxing (Honey)', name: 'Underarms Wax - Honey', price: 100 },
  { cat: 'Waxing (Honey)', name: 'Upper Lips Wax - Honey', price: 50 },
  { cat: 'Waxing (Honey)', name: 'Chin Wax - Honey', price: 50 },
  { cat: 'Waxing (Honey)', name: 'Both Side Locks Wax - Honey', price: 200 },
  { cat: 'Waxing (Honey)', name: 'Forehead Wax - Honey', price: 50 },
  { cat: 'Threading', name: 'Eyebrow Threading', price: 50 },
  { cat: 'Threading', name: 'Upper Lips Threading', price: 30 },
  { cat: 'Threading', name: 'Forehead Threading', price: 30 },
  { cat: 'Threading', name: 'Chin Threading', price: 30 },
  { cat: 'Threading', name: 'Both Side Locks Threading', price: 100 },
  { cat: 'Haircuts & Grooming', name: "Men's Haircut", price: 300 },
  { cat: 'Haircuts & Grooming', name: "Boy's Haircut (Below 12 Years)", price: 250 },
  { cat: 'Haircuts & Grooming', name: 'Female Haircut', price: 700 },
  { cat: 'Haircuts & Grooming', name: "Girl's Haircut (Below 12 Years)", price: 500 },
  { cat: 'Haircuts & Grooming', name: 'Hair Trimming', price: 500 },
  { cat: 'Haircuts & Grooming', name: 'Shaving', price: 100 },
  { cat: 'Haircuts & Grooming', name: 'Designer Shaving', price: 150 },
  { cat: 'Haircuts & Grooming', name: 'Shaving with Cleanup', price: 550 },
  { cat: 'Haircuts & Grooming', name: 'Beard with Colour', price: 800 },
  { cat: 'Haircuts & Grooming', name: 'Shaving / Beard Trimming with D-Tan', price: 500 },
  { cat: 'Hair Styling & Wash', name: 'Blow Dry', price: 300 },
  { cat: 'Hair Styling & Wash', name: 'Blow Dry + Hair Wash', price: 500 },
  { cat: 'Hair Styling & Wash', name: 'Straight Dryer', price: 400 },
  { cat: 'Hair Styling & Wash', name: 'Hair Wash (Men)', price: 150 },
  { cat: 'Hair Styling & Wash', name: 'Hair Wash (Women)', price: 300 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'O3+ Clean Up', price: 1000 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Lotus Clean Up', price: 600 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Fruit Clean Up', price: 500 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Ozone Clean Up', price: 500 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Full Body Polishing', price: 2500 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Full Body Bleach', price: 2500 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Face Bleach', price: 350 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'O3+ D-Tan', price: 700 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Raaga D-Tan', price: 500 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Kanpeki D-Tan', price: 900 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Ozone D-Tan', price: 600 },
  { cat: 'Facial, Clean Up & D-Tan', name: 'Ozone D-Tan Facial', price: 1500 },
  { cat: 'Premium Facials', name: 'Jeannot Infinite Youth (90 Min)', price: 5000 },
  { cat: 'Premium Facials', name: 'Kanpeki Hydra Facial', price: 5000 },
  { cat: 'Premium Facials', name: 'Kanpeki Whitening Facial', price: 5000 },
  { cat: 'Premium Facials', name: 'O3+ Age Lock Facial', price: 5000 },
  { cat: 'Premium Facials', name: 'O3+ Skin Brightening Facial', price: 4000 },
  { cat: 'Premium Facials', name: 'Gold Facial', price: 3500 },
  { cat: 'Premium Facials', name: 'Aroma Facial', price: 1200 },
  { cat: 'Premium Facials', name: 'Lotus Facial', price: 1500 },
  { cat: 'Premium Facials', name: 'Korean Facial', price: 4000 },
  { cat: 'Premium Facials', name: 'Korean Facial with Hydra', price: 4500 },
  { cat: 'Premium Facials', name: 'Hydra Add-on', price: 1000 },
  { cat: 'Premium Facials', name: 'Jeannot Hydra Boost (90 Min)', price: 6000 },
  { cat: 'Premium Facials', name: 'Jeannot Instant Glow (60 Min)', price: 5000 },
  { cat: 'Premium Facials', name: 'Jeannot Derma Clean (60 Min)', price: 5000 },
  { cat: 'Premium Facials', name: 'Jeannot Whitening Detox (60 Min)', price: 5000 },
  { cat: 'Hair Colour', name: 'Hair Colour - Male', price: 800 },
  { cat: 'Hair Colour', name: 'Inoa Hair Colour - Male', price: 1000 },
  { cat: 'Hair Colour', name: 'Hair Colour with Highlights - Male', price: 2500 },
  { cat: 'Hair Colour', name: 'Global Colour', price: 3500 },
  { cat: 'Hair Colour', name: 'Global Inoa Colour', price: 4000 },
  { cat: 'Hair Colour', name: 'Highlight One Streak', price: 300 },
  { cat: 'Hair Colour', name: 'Highlight with Global', price: 7500 },
  { cat: 'Hair Colour', name: 'Balayage All Over with Global', price: 8500 },
  { cat: 'Hair Colour', name: 'Matrix Touch Up', price: 900 },
  { cat: 'Hair Colour', name: 'Inoa Touch Up', price: 1200 },
  { cat: 'Hair Colour', name: "L'Oreal Touch Up", price: 1100 },
  { cat: 'Hair Spa', name: 'Hair Spa (Men)', price: 700 },
  { cat: 'Hair Spa', name: 'Hair Spa (Women)', price: 1000 },
  { cat: 'Hair Spa', name: "L'Oreal Hair Spa (Women)", price: 1500 },
  { cat: 'Massage', name: 'Head Massage (30 Min)', price: 500 },
  { cat: 'Massage', name: 'Head + Back Massage (45 Min)', price: 700 },
  { cat: 'Massage', name: 'Back Massage (30 Min)', price: 500 },
  { cat: 'Massage', name: 'Foot Massage (30 Min)', price: 500 },
  { cat: 'Massage', name: 'Facial Massage (30 Min)', price: 500 },
  { cat: 'Massage', name: 'Shoulder & Neck Massage (30 Min)', price: 500 },
  { cat: 'Massage', name: 'Full Body Massage (Oil/Cream)', price: 2000 },
  { cat: 'Makeup', name: 'Air Brush Bridal Makeup', price: 21000 },
  { cat: 'Makeup', name: 'Air Brush Engagement / Reception Makeup', price: 12000 },
  { cat: 'Makeup', name: 'Air Brush Party Makeup', price: 7000 },
  { cat: 'Makeup', name: 'HD Bridal Makeup', price: 15000 },
  { cat: 'Makeup', name: 'HD Engagement / Reception Makeup', price: 9000 },
  { cat: 'Makeup', name: 'HD Party Makeup', price: 5000 },
  { cat: 'Makeup', name: 'Eye Makeup', price: 500 },
  { cat: 'Makeup', name: 'Groom Makeup', price: 2500 },
  { cat: 'Makeup', name: 'Reception Makeup', price: 10000 },
  { cat: 'Makeup', name: 'Cocktail Makeup', price: 8000 },
  { cat: 'Makeup', name: 'Carnival Makeup', price: 8000 },
  { cat: 'Packages', name: 'Pre-Bridal Package', price: 30000 },
  { cat: 'Packages', name: 'Pre-Groom Package', price: 15000 },
  { cat: 'Combos', name: 'Haircut + Beard + Facial + Hair Colour', price: 1599 },
  { cat: 'Combos', name: 'Haircut + Beard + D-Tan + Head Massage', price: 999 },
  { cat: 'Combos', name: 'Haircut + Beard + D-Tan', price: 699 },
  { cat: 'Combos', name: 'Beard + D-Tan', price: 499 },
  { cat: 'Combos', name: 'Full Arms + Full Legs + Underarms (Rica)', price: 999 },
  { cat: 'Combos', name: 'Hand Wax + Half Leg Wax + Underarms (Rica) + Facial + D-Tan', price: 1799 },
  { cat: 'Combos', name: 'Cleanup + Manicure/Pedicure + Threading + Upper Lip + Forehead', price: 899 },
  { cat: 'Combos', name: 'Hair Wash + Hair Cut + Threading + Upper Lips + Forehead + D-Tan', price: 799 },
  { cat: 'Combos', name: 'Hair Wash + Hair Spa + Threading + Cleanup (Basic)', price: 1099 },
  { cat: 'Combos', name: 'Hair Wash + Hair Spa + Hair Cut + Facial (O3+) + D-Tan + Full Arms + Half Legs + Underarms', price: 2499 },
];

const CATS = [...new Set(CATALOGUE.map((s) => s.cat))];

function ServicePicker({ onSelect }) {
  const [q, setQ] = useState('');
  const [openCats, setOpenCats] = useState({});
  const [showBrowse, setShowBrowse] = useState(false);
  const ref = useRef(null);

  const results = q.trim()
    ? CATALOGUE.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.cat.toLowerCase().includes(q.toLowerCase()))
    : null;

  const pick = (s) => { onSelect(s); setQ(''); ref.current?.focus(); };
  const toggle = (c) => setOpenCats((p) => ({ ...p, [c]: !p[c] }));

  return (
    <div className="card">
      <p className="text-sm font-semibold text-dark-100 mb-2 flex items-center gap-2">
        <Search size={14} className="text-accent" />
        Service Catalogue &mdash; search or browse, click to add
      </p>
      <div className="relative mb-2">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search service..." className="pl-8 text-sm" />
      </div>

      {results ? (
        <div className="max-h-52 overflow-y-auto space-y-0.5">
          {results.length === 0 && <p className="text-dark-400 text-sm py-2 px-1">No services found</p>}
          {results.map((s, i) => (
            <button key={i} type="button" onClick={() => pick(s)}
              className="w-full flex justify-between items-center px-3 py-1.5 rounded-lg hover:bg-dark-700 text-left transition-colors gap-2">
              <span className="text-sm text-dark-100 truncate">{s.name}</span>
              <span className="text-sm font-semibold text-accent shrink-0">&#8377;{s.price.toLocaleString('en-IN')}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setShowBrowse((v) => !v)}
            className="text-xs text-dark-400 hover:text-accent flex items-center gap-1 mb-2">
            {showBrowse ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showBrowse ? 'Hide categories' : 'Browse by category'}
          </button>
          {showBrowse && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {CATS.map((cat) => {
                const svcs = CATALOGUE.filter((s) => s.cat === cat);
                const open = openCats[cat];
                return (
                  <div key={cat} className="border border-dark-700 rounded-lg overflow-hidden">
                    <button type="button" onClick={() => toggle(cat)}
                      className="w-full flex justify-between items-center px-3 py-2 text-sm font-medium text-dark-200 hover:bg-dark-700 transition-colors">
                      <span>{cat}</span>
                      <span className="flex items-center gap-1 text-dark-400 text-xs">
                        {svcs.length}{open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </span>
                    </button>
                    {open && (
                      <div className="border-t border-dark-700">
                        {svcs.map((s, i) => (
                          <button key={i} type="button" onClick={() => pick(s)}
                            className="w-full flex justify-between items-center px-4 py-1.5 hover:bg-dark-700 text-left transition-colors gap-2">
                            <span className="text-sm text-dark-300 truncate">{s.name}</span>
                            <span className="text-sm font-semibold text-accent shrink-0">&#8377;{s.price.toLocaleString('en-IN')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Invoice() {
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [loadingNumber, setLoadingNumber] = useState(true);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'pct'
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [resendModal, setResendModal] = useState(null); // invoice object or null
  const [resendPhone, setResendPhone] = useState('');
  const [resending, setResending] = useState(false);

  const fetchNextNumber = async () => {
    setLoadingNumber(true);
    try {
      const { data } = await invoiceAPI.getNextNumber();
      setInvoiceNumber(data.data.invoice_number);
    } catch { toast.error('Failed to load invoice number'); }
    finally { setLoadingNumber(false); }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await invoiceAPI.getAll({ limit: 10, page: 1 });
      setInvoiceHistory(data.data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchNextNumber(); fetchHistory(); }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0);
    const discVal = Number(discount) || 0;
    const discAmt = discountType === 'pct' ? Math.round((subtotal * discVal / 100) * 100) / 100 : discVal;
    const taxable = Math.max(subtotal - discAmt, 0);
    const tax = taxRate ? Math.round((taxable * Number(taxRate) / 100) * 100) / 100 : 0;
    return { subtotal, discAmt, tax, total: taxable + tax };
  }, [items, discount, discountType, taxRate]);

  const updateItem = (i, f, v) => setItems((p) => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
  const addItem = () => setItems((p) => [...p, { ...emptyItem }]);
  const removeItem = (i) => { if (items.length > 1) setItems((p) => p.filter((_, idx) => idx !== i)); };

  const handleServiceSelect = (svc) => {
    const last = items[items.length - 1];
    if (!last.description && !last.price) {
      setItems((p) => p.map((it, i) => i === p.length - 1 ? { description: svc.name, quantity: 1, price: svc.price } : it));
    } else {
      setItems((p) => [...p, { description: svc.name, quantity: 1, price: svc.price }]);
    }
    toast.success(`Added: ${svc.name}`, { duration: 1200 });
  };

  const resetForm = (nextNum) => {
    setCustomer(emptyCustomer); setItems([{ ...emptyItem }]);
    setDiscount(0); setTaxRate(0); setNotes('');
    if (nextNum) setInvoiceNumber(nextNum); else fetchNextNumber();
    fetchHistory();
  };

  const handleDownloadPdf = async (id, num) => {
    setDownloading(id);
    try {
      const { data } = await invoiceAPI.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `Invoice-${String(num).padStart(4, '0')}.pdf`; a.click();
      window.URL.revokeObjectURL(url); toast.success('PDF downloaded');
    } catch { toast.error('Failed to download PDF'); }
    finally { setDownloading(null); }
  };

  const handleResend = async () => {
    if (!resendModal) return;
    setResending(true);
    try {
      await invoiceAPI.resend(resendModal.id, resendPhone || resendModal.customer_phone);
      toast.success(`Invoice #${String(resendModal.invoice_number).padStart(4,'0')} resent!`);
      setResendModal(null);
      setResendPhone('');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  const handleSaveAndSend = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await invoiceAPI.saveAndSend({
        customer,
        items: items.map((it) => ({ description: it.description, quantity: Number(it.quantity), price: Number(it.price) })),
        discount: totals.discAmt, tax_rate: Number(taxRate) || 0,
        notes: notes || null, send_whatsapp: true,
      });
      toast.success(data.message || 'Saved and sent via WhatsApp');
      resetForm(data.data.next_invoice_number);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice</h1>
          <p className="text-dark-400 text-sm mt-1">Create invoice and send to customer via WhatsApp</p>
        </div>
        <button type="button" onClick={fetchNextNumber} className="btn-secondary" disabled={loadingNumber}>
          <RefreshCw size={16} className={loadingNumber ? 'animate-spin' : ''} /> Refresh Number
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ServicePicker onSelect={handleServiceSelect} />

          <form onSubmit={handleSaveAndSend} className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-semibold text-dark-100 mb-4">Customer Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Name *</label>
                  <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">DOB</label>
                  <input type="date" value={customer.birthday} onChange={(e) => setCustomer({ ...customer, birthday: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Anniversary</label>
                  <input type="date" value={customer.anniversary} onChange={(e) => setCustomer({ ...customer, anniversary: e.target.value })} />
                </div>
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Address</label>
                  <textarea rows={2} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={customer.gender} onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-dark-100">Services / Items</h2>
                <button type="button" onClick={addItem} className="btn-secondary text-sm py-1.5">
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-5 form-group">
                      {index === 0 && <label className="form-label">Description</label>}
                      <input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Service name" required />
                    </div>
                    <div className="col-span-4 sm:col-span-2 form-group">
                      {index === 0 && <label className="form-label">Qty</label>}
                      <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required />
                    </div>
                    <div className="col-span-5 sm:col-span-3 form-group">
                      {index === 0 && <label className="form-label">Price (Rs.)</label>}
                      <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} required />
                    </div>
                    <div className="col-span-3 sm:col-span-2 flex justify-end pb-0.5">
                      <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                        className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 disabled:opacity-30">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-700">
                <div className="form-group">
                  <label className="form-label flex items-center justify-between">
                    <span>Discount</span>
                    <span className="flex rounded overflow-hidden border border-dark-600 text-xs">
                      <button type="button"
                        className={`px-2 py-0.5 ${discountType === 'flat' ? 'bg-accent text-white' : 'text-dark-400 hover:bg-dark-700'}`}
                        onClick={() => setDiscountType('flat')}>Rs.</button>
                      <button type="button"
                        className={`px-2 py-0.5 ${discountType === 'pct' ? 'bg-accent text-white' : 'text-dark-400 hover:bg-dark-700'}`}
                        onClick={() => setDiscountType('pct')}>%</button>
                    </span>
                  </label>
                  <input type="number" min="0" step="0.01" max={discountType === 'pct' ? 100 : undefined}
                    value={discount} onChange={(e) => setDiscount(e.target.value)}
                    placeholder={discountType === 'pct' ? 'e.g. 10' : 'e.g. 100'} />
                  {discountType === 'pct' && totals.discAmt > 0 && (
                    <p className="text-xs text-dark-400 mt-0.5">= Rs.{totals.discAmt.toFixed(2)} off</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (%)</label>
                  <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Notes</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
              <Send size={16} />{saving ? 'Saving...' : 'Save Customer & Send WhatsApp'}
            </button>
          </form>
        </div>

        <div className="card invoice-preview bg-white text-gray-900">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
            <div>
              <img src="/logo.svg" alt="Salon Logo" className="h-16 w-auto max-w-[180px] object-contain mb-2" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <p className="text-sm text-gray-500">Tax Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Invoice No.</p>
              <p className="text-2xl font-bold text-gray-900">{loadingNumber ? '...' : `#${String(invoiceNumber).padStart(4, '0')}`}</p>
              <p className="text-sm text-gray-500 mt-1">{today}</p>
              <button type="button" onClick={() => toast('Save the invoice first, then download from history below.', { icon: 'i' })}
                className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 ml-auto">
                <Download size={12} /> PDF Preview
              </button>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Bill To</p>
            <p className="font-semibold">{customer.name || '-'}</p>
            <p className="text-sm text-gray-600">{customer.phone || '-'}</p>
            {customer.address && <p className="text-sm text-gray-600 mt-1">{customer.address}</p>}
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium text-center w-12">Qty</th>
                <th className="py-2 font-medium text-right w-20">Rate</th>
                <th className="py-2 font-medium text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const qty = Number(it.quantity) || 0;
                const price = Number(it.price) || 0;
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">{it.description || '-'}</td>
                    <td className="py-2 text-center">{qty}</td>
                    <td className="py-2 text-right">Rs.{price.toFixed(2)}</td>
                    <td className="py-2 text-right">Rs.{(qty * price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>Rs.{totals.subtotal.toFixed(2)}</span></div>
            {totals.discAmt > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount{discountType === 'pct' ? ` (${discount}%)` : ''}</span>
                <span>-Rs.{totals.discAmt.toFixed(2)}</span>
              </div>
            )}
            {Number(taxRate) > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax ({taxRate}%)</span><span>Rs.{totals.tax.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>Rs.{totals.total.toFixed(2)}</span></div>
          </div>
          {notes && <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">{notes}</p>}
        </div>
      </div>

      {invoiceHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-accent" /> Recent Invoices
          </h2>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Customer</th><th>Phone</th><th>Total</th><th>Date</th><th>WhatsApp</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {invoiceHistory.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono font-semibold text-accent">#{String(inv.invoice_number).padStart(4, '0')}</td>
                    <td className="font-medium text-dark-100">{inv.customer_name}</td>
                    <td className="font-mono text-sm">{inv.customer_phone}</td>
                    <td className="font-semibold">Rs.{Number(inv.total).toFixed(2)}</td>
                    <td className="text-sm text-dark-400">{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                    <td><span className={inv.whatsapp_sent ? 'badge-success' : 'badge-danger'}>{inv.whatsapp_sent ? 'Sent' : 'Not Sent'}</span></td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleDownloadPdf(inv.id, inv.invoice_number)} disabled={downloading === inv.id}
                          className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                          <Download size={13} />{downloading === inv.id ? '...' : 'PDF'}
                        </button>
                        <button onClick={() => { setResendModal(inv); setResendPhone(inv.customer_phone || ''); }}
                          className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                          <Send size={13} /> Resend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Resend Modal */}
      {resendModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-dark-50 mb-1">
              Resend Invoice #{String(resendModal.invoice_number).padStart(4,'0')}
            </h3>
            <p className="text-sm text-dark-400 mb-4">
              Send PDF to any WhatsApp number. Leave unchanged to resend to original customer.
            </p>
            <div className="form-group mb-4">
              <label className="form-label">WhatsApp Number</label>
              <input
                value={resendPhone}
                onChange={(e) => setResendPhone(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setResendModal(null); setResendPhone(''); }}
                className="btn-secondary" disabled={resending}>Cancel</button>
              <button type="button" onClick={handleResend}
                className="btn-primary flex items-center gap-2" disabled={resending}>
                <Send size={14} />{resending ? 'Sending...' : 'Send via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
