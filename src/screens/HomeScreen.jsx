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

  // Calculate today's bills and revenue
  const today = new Date().toDateString();
  const todaysBills = bills.filter(b => new Date(b.date).toDateString() === today);
  const revenue = todaysBills.reduce((sum, b) => sum + b.total, 0);

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
      tab: 'profile',
      badge: null,
    },
  ];

  const stats = [
    { label: "Today's Bills", value: String(todaysBills.length), icon: <Receipt size={16} />, color: 'var(--primary)' },
    { label: 'Products', value: String(products.length), icon: <Package size={16} />, color: 'var(--info)' },
    { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={16} />, color: 'var(--success)' },
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
