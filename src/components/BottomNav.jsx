import { motion } from 'framer-motion';
import { Home, Receipt, Package, BookOpen, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'khata', label: 'Khata', icon: BookOpen },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            id={`nav-${item.id}`}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="nav-active-dot"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
