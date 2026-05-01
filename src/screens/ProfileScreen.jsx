import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, User, Phone, MapPin, Hash, LogOut, ChevronRight,
  Shield, Pencil, Check, X, Users, Bell, HelpCircle, Info
} from 'lucide-react';
import { useApp, SHOP_TYPES } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import './ProfileScreen.css';


export default function ProfileScreen() {
  const { user, shop, setUser, setShop, updateShopState, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: shop?.name || '',
    phone: shop?.phone || '',
    address: shop?.address || '',
    gst: shop?.gst || '',
    owner_name: shop?.owner_name || '',
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const shopType = SHOP_TYPES.find(s => s.value === shop?.type);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Shop name required');
    setLoading(true);
    try {
      if (user?.id === 'demo_user') {
        const updated = { ...shop, ...form };
        localStorage.setItem('invoeazy_demo_shop', JSON.stringify(updated));
        updateShopState(updated);
        toast.success('Shop updated ✓');
        setEditing(false);
      } else {
        const { data, error } = await supabase
          .from('shops')
          .update(form)
          .eq('id', shop.id)
          .select()
          .single();
        if (error) throw error;
        updateShopState(data);
        toast.success('Shop updated ✓');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ME';

  return (
    <div className="profile-screen">
      {/* Header */}
      <div className="app-header">
        <div className="header-inner">
          <div>
            <h2 className="header-title">My Shop</h2>
            <p className="header-subtitle">Settings & profile</p>
          </div>
          <button
            className={`btn ${editing ? 'btn-danger' : 'btn-secondary'} btn-sm`}
            onClick={() => editing ? setEditing(false) : setEditing(true)}
          >
            {editing ? <><X size={15} /> Cancel</> : <><Pencil size={15} /> Edit</>}
          </button>
        </div>
      </div>

      <div className="page">
        <div className="page-content" style={{ paddingTop: 20 }}>
          {/* Shop Avatar */}
          <motion.div
            className="profile-hero"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {getInitials(shop?.name || '')}
              </div>
              <div className="profile-type-chip">
                {shopType?.emoji}
              </div>
            </div>
            <h2 className="profile-name">{shop?.name || 'My Shop'}</h2>
            <p className="profile-type">{shopType?.label}</p>
            {shop?.gst && (
              <span className="chip chip-muted" style={{ marginTop: 4 }}>
                GST: {shop.gst}
              </span>
            )}
          </motion.div>

          {/* Shop Info / Edit */}
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="edit-section"
              >
                <div className="form-group">
                  <label className="form-label">Shop Name</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><Store size={16} /></span>
                    <input className="form-input" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><User size={16} /></span>
                    <input className="form-input" value={form.owner_name} onChange={e => update('owner_name', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><Phone size={16} /></span>
                    <input className="form-input" value={form.phone} onChange={e => update('phone', e.target.value)} type="tel" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><MapPin size={16} /></span>
                    <input className="form-input" value={form.address} onChange={e => update('address', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><Hash size={16} /></span>
                    <input className="form-input" value={form.gst} onChange={e => update('gst', e.target.value.toUpperCase())} />
                  </div>
                </div>
                <motion.button
                  className="btn btn-primary btn-full"
                  onClick={handleSave}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <><Check size={16} /> Save Changes</>}
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Info Cards */}
                <div className="info-section">
                  <InfoRow icon={<User size={16} />} label="Owner" value={shop?.owner_name || '—'} />
                  <InfoRow icon={<Phone size={16} />} label="Phone" value={shop?.phone || '—'} />
                  <InfoRow icon={<MapPin size={16} />} label="Address" value={shop?.address || '—'} />
                  <InfoRow icon={<Hash size={16} />} label="GST" value={shop?.gst || 'Not set'} last />
                </div>

                {/* Settings Links */}
                <div className="section-heading" style={{ marginTop: 24 }}>
                  <h3>Manage</h3>
                </div>
                <div className="settings-list">
                  <SettingsItem icon={<Users size={18} />} label="Employees" sublabel="Coming in Phase 2" color="#10B981" />
                  <SettingsItem icon={<Shield size={18} />} label="Permissions" sublabel="Manage role access" color="#3B82F6" />
                  <SettingsItem icon={<Bell size={18} />} label="Notifications" sublabel="Bill reminders" color="#F59E0B" />
                </div>

                <div className="section-heading" style={{ marginTop: 20 }}>
                  <h3>Support</h3>
                </div>
                <div className="settings-list">
                  <SettingsItem icon={<HelpCircle size={18} />} label="Help & FAQ" color="#7C3AED" />
                  <SettingsItem icon={<Info size={18} />} label="About Invoeazy" sublabel="v1.0.0 — Phase 1" color="#6B7280" />
                </div>

                {/* Demo badge */}
                {user?.id === 'demo_user' && (
                  <div className="demo-notice">
                    <span>⚡</span>
                    <span>You're in <strong>Demo Mode</strong> — data stored locally</span>
                  </div>
                )}

                {/* Logout */}
                <motion.button
                  className="btn btn-danger btn-full logout-btn"
                  onClick={handleLogout}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOut size={17} />
                  Sign Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, last }) {
  return (
    <div className={`info-row ${last ? 'last' : ''}`}>
      <div className="info-icon">{icon}</div>
      <div className="info-content">
        <div className="info-label">{label}</div>
        <div className="info-value">{value}</div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, label, sublabel, color = 'var(--primary)' }) {
  return (
    <div className="settings-item">
      <div className="settings-icon" style={{ '--si-color': color }}>
        {icon}
      </div>
      <div className="settings-content">
        <div className="settings-label">{label}</div>
        {sublabel && <div className="settings-sub">{sublabel}</div>}
      </div>
      <ChevronRight size={16} className="settings-arrow" />
    </div>
  );
}
