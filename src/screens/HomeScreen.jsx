import { motion } from 'framer-motion';
import {
  Store, Package, Receipt, BookOpen, TrendingUp,
  ChevronRight, Sparkles, Users, ArrowUpRight
} from 'lucide-react';
import { useApp, SHOP_TYPES } from '../context/AppContext';
import './HomeScreen.css';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }),
};

export default function HomeScreen({ onNavigate }) {
  const { shop, products, user, bills } = useApp();

  const shopType = SHOP_TYPES.find(s => s.value === shop?.type);
  const greeting = getGreeting();
  const ownerName = shop?.owner_name || user?.email?.split('@')[0] || 'Owner';

  // Calculate today's and this month's revenue
  const today = new Date();
  const todaysBills = bills.filter(b => new Date(b.date).toDateString() === today.toDateString());
  const todayRevenue = todaysBills.reduce((sum, b) => sum + b.total, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthlyBills = bills.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyBills.reduce((sum, b) => sum + b.total, 0);

  const quickActions = [
    {
      id: 'billing',
      icon: <Receipt size={24} />,
      label: 'New Bill',
      sublabel: 'Create invoice',
      color: '#7C3AED',
      bg: '#EDE9FE',
      tab: 'billing',
      badge: null,
    },
    {
      id: 'products',
      icon: <Package size={24} />,
      label: 'Products',
      sublabel: `${products.length} items`,
      color: '#3B82F6',
      bg: '#DBEAFE',
      tab: 'products',
      badge: null,
    },
    {
      id: 'khata',
      icon: <BookOpen size={24} />,
      label: 'Khata',
      sublabel: 'Credit book',
      color: '#F59E0B',
      bg: '#FEF3C7',
      tab: 'khata',
      badge: null,
    },
    {
      id: 'employees',
      icon: <Users size={24} />,
      label: 'Employees',
      sublabel: 'Manage staff',
      color: '#10B981',
      bg: '#D1FAE5',
      tab: 'employees',
      badge: null,
    },
  ];

  const stats = [
    { label: "Today's Bills", value: String(todaysBills.length), icon: <Receipt size={16} />, color: 'var(--primary)' },
    { label: "Today's Rev", value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={16} />, color: 'var(--info)' },
    { label: 'Month Rev', value: `₹${monthlyRevenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={16} />, color: 'var(--success)' },
  ];

  return (
    <div className="home-screen">
      {/* Top Section */}
      <div className="home-top">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />

        <div className="home-top-inner">
          <div className="home-greeting-row">
            <div>
              <p className="home-greeting">{greeting} 👋</p>
              <h2 className="home-owner">{ownerName}</h2>
            </div>
            <div className="home-shop-badge">
              <span>{shopType?.emoji || '🏪'}</span>
            </div>
          </div>

          {/* Shop Card */}
          <motion.div
            className="shop-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="shop-card-left">
              <div className="shop-card-icon">
                <Store size={22} />
              </div>
              <div>
                <div className="shop-card-name">{shop?.name || 'My Shop'}</div>
                <div className="shop-card-type">
                  {shopType?.emoji} {shopType?.label}
                </div>
              </div>
            </div>
            <div className="shop-status-dot">
              <span className="status-pulse" />
              Open
            </div>
          </motion.div>
        </div>
      </div>

      <div className="page">
        <div className="page-content">

          {/* Stats Row */}
          <motion.div
            className="stats-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <div className="section-heading" style={{ marginTop: 24 }}>
            <h3>Quick Actions</h3>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.id}
                custom={i}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                className="quick-action-card"
                style={{ '--action-color': action.color, '--action-bg': action.bg }}
                onClick={() => onNavigate(action.tab)}
                whileTap={{ scale: 0.94 }}
              >
                <div className="qa-icon-wrap">
                  {action.icon}
                </div>
                <div className="qa-label">{action.label}</div>
                <div className="qa-sublabel">{action.sublabel}</div>
                <ArrowUpRight size={14} className="qa-arrow" />
              </motion.button>
            ))}
          </div>

          {/* Pro Features Section */}
          <div className="section-heading" style={{ marginTop: 24 }}>
            <h3>Settings & Customization</h3>
          </div>

          <motion.div
            className="coming-soon-banner"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => onNavigate('designer')}
            style={{ cursor: 'pointer' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="csb-icon" style={{ background: '#FCE7F3', color: '#DB2777' }}>
              <Sparkles size={20} />
            </div>
            <div className="csb-content">
              <div className="csb-title">Bill Designer</div>
              <div className="csb-desc">Customize your bill layout, colors, and logo</div>
            </div>
            <ChevronRight size={18} className="csb-arrow" />
          </motion.div>

          {/* Recent Bills Section */}
          <div className="section-heading" style={{ marginTop: 32, marginBottom: 12 }}>
            <h3>Recent Bills</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{bills.length} saved</span>
          </div>

          <div className="recent-bills-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                No bills generated yet. Go to Billing to create one!
              </div>
            ) : (
              bills.slice(0, 5).map((b, idx) => (
                <div key={b.id} style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                      #{b.id.substring(0,8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(b.date).toLocaleDateString()} • {b.items.length} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                      ₹{b.total.toLocaleString()}
                    </div>
                    {b.isKhata && (
                      <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        KHATA
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {bills.length > 5 && (
              <button 
                className="btn btn-ghost" 
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => onNavigate('profile')}
              >
                View All in History
              </button>
            )}
          </div>
          
          <div style={{ height: 100 }}></div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
