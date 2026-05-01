import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, MapPin, Phone, Hash, ChevronRight, ChevronLeft,
  Check, Building2, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp, SHOP_TYPES, getDefaultProducts } from '../context/AppContext';
import toast from 'react-hot-toast';
import './ShopSetup.css';

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25 } }),
};

const STEPS = ['Type', 'Details', 'Done'];

export default function ShopSetupScreen() {
  const { user, updateShopState, demoLogin } = useApp();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    type: '',
    name: '',
    phone: '',
    address: '',
    gst: '',
    ownerName: '',
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const goNext = () => {
    if (step === 0 && !form.type) return toast.error('Please select shop type');
    if (step === 1) {
      if (!form.name.trim()) return toast.error('Shop name is required');
      if (!form.phone.trim()) return toast.error('Phone number is required');
    }
    setDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep(s => s - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const shopData = {
        owner_id: user?.id,
        name: form.name.trim(),
        type: form.type,
        phone: form.phone.trim(),
        address: form.address.trim(),
        gst: form.gst.trim(),
        owner_name: form.ownerName.trim(),
      };

      if (user?.id === 'demo_user') {
        // Demo mode — save to localStorage
        const shop = { ...shopData, id: 'demo_shop' };
        localStorage.setItem('invoeazy_demo_shop', JSON.stringify(shop));
        const defaults = getDefaultProducts(form.type);
        localStorage.setItem(`invoeazy_products_demo_shop`, JSON.stringify(defaults));
        updateShopState(shop);
        toast.success('Shop setup complete! 🎉');
      } else {
        const { data, error } = await supabase
          .from('shops')
          .insert([shopData])
          .select()
          .single();
        if (error) throw error;
        updateShopState(data);
        toast.success('Shop created! 🎉');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-orb setup-orb-1" />
      <div className="setup-orb setup-orb-2" />

      {/* Header */}
      <div className="setup-header">
        <div className="setup-logo">
          <Store size={20} />
        </div>
        <span className="setup-brand">Invoeazy</span>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={s} className="step-item">
            <motion.div
              className={`step-dot ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              animate={{ scale: i === step ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </motion.div>
            <span className={`step-label ${i === step ? 'active' : ''}`}>{s}</span>
          </div>
        ))}
        <div className="step-line" />
      </div>

      {/* Step Content */}
      <div className="setup-content">
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div
              key="step0"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="step-panel"
            >
              <div className="step-title-area">
                <Building2 size={28} className="step-icon-main" />
                <h2>What type of shop?</h2>
                <p>We'll pre-load products based on your shop type</p>
              </div>

              <div className="shop-type-grid">
                {SHOP_TYPES.map((st, i) => (
                  <motion.button
                    key={st.value}
                    className={`shop-type-card ${form.type === st.value ? 'selected' : ''}`}
                    onClick={() => update('type', st.value)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="shop-type-emoji">{st.emoji}</span>
                    <span className="shop-type-label">{st.label}</span>
                    {form.type === st.value && (
                      <motion.div
                        className="type-check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Check size={10} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="step-panel"
            >
              <div className="step-title-area">
                <Store size={28} className="step-icon-main" />
                <h2>Shop Details</h2>
                <p>Tell us about your shop</p>
              </div>

              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Store size={17} /></span>
                  <input
                    className="form-input"
                    placeholder="e.g. Sharma Kirana Store"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Sparkles size={17} /></span>
                  <input
                    className="form-input"
                    placeholder="Your name"
                    value={form.ownerName}
                    onChange={e => update('ownerName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Phone size={17} /></span>
                  <input
                    className="form-input"
                    placeholder="10-digit mobile number"
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <div className="form-input-icon">
                  <span className="input-icon"><MapPin size={17} /></span>
                  <input
                    className="form-input"
                    placeholder="Shop address (optional)"
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST Number</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Hash size={17} /></span>
                  <input
                    className="form-input"
                    placeholder="GST number (optional)"
                    value={form.gst}
                    onChange={e => update('gst', e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="step-panel step-done"
            >
              <motion.div
                className="done-icon"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                🎉
              </motion.div>
              <h2>Almost ready!</h2>
              <p>Here's a summary of your shop</p>

              <div className="summary-card">
                <div className="summary-row">
                  <span className="summary-key">Shop Name</span>
                  <span className="summary-val">{form.name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Type</span>
                  <span className="summary-val">
                    {SHOP_TYPES.find(s => s.value === form.type)?.emoji}{' '}
                    {SHOP_TYPES.find(s => s.value === form.type)?.label}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Phone</span>
                  <span className="summary-val">{form.phone}</span>
                </div>
                {form.address && (
                  <div className="summary-row">
                    <span className="summary-key">Address</span>
                    <span className="summary-val">{form.address}</span>
                  </div>
                )}
                {form.gst && (
                  <div className="summary-row">
                    <span className="summary-key">GST</span>
                    <span className="summary-val">{form.gst}</span>
                  </div>
                )}
              </div>

              <div className="preload-note">
                <Sparkles size={14} />
                Products for <strong>{SHOP_TYPES.find(s => s.value === form.type)?.label}</strong> will be pre-loaded. You can edit them anytime.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Buttons */}
      <div className="setup-footer">
        {step > 0 && (
          <motion.button
            className="btn btn-ghost setup-back"
            onClick={goBack}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={18} />
            Back
          </motion.button>
        )}

        {step < 2 ? (
          <motion.button
            className="btn btn-primary setup-next"
            onClick={goNext}
            whileTap={{ scale: 0.97 }}
          >
            Next
            <ChevronRight size={18} />
          </motion.button>
        ) : (
          <motion.button
            className="btn btn-primary setup-next"
            onClick={handleSave}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              <>
                Launch My Shop
                <Sparkles size={18} />
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
