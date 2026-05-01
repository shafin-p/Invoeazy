import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './screens/AuthScreen';
import ShopSetupScreen from './screens/ShopSetupScreen';
import HomeScreen from './screens/HomeScreen';
import ProductManagerScreen from './screens/ProductManagerScreen';
import BillingScreen from './screens/BillingScreen';
import KhataScreen from './screens/KhataScreen';
import BillViewerScreen from './screens/BillViewerScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNav from './components/BottomNav';
import './components/BottomNav.css';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AppShell() {
  const { user, shop, loading, authReady } = useApp();
  const [activeTab, setActiveTab] = useState('home');

  // Demo mode: restore from localStorage on first load
  useEffect(() => {
    if (!loading && !user) {
      const demoUser = localStorage.getItem('invoeazy_demo_user');
      if (demoUser) {
        // AppContext will handle this via its own effect
      }
    }
  }, [loading, user]);

  if (loading || !authReady) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <div className="app-shell" style={{ maxWidth: 430 }}>
        <AuthScreen />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="app-shell" style={{ maxWidth: 430 }}>
        <ShopSetupScreen />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ maxWidth: 430 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} />}
          {activeTab === 'billing' && <BillingScreen />}
          {activeTab === 'products' && <ProductManagerScreen />}
          {activeTab === 'khata' && <KhataScreen />}
          {activeTab === 'profile' && <ProfileScreen />}
        </motion.div>
      </AnimatePresence>

      <BottomNav active={activeTab} onNavigate={setActiveTab} />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxWidth: '340px',
          },
        }}
      />
    </div>
  );
}

function SplashScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      background: 'var(--bg)',
      gap: 16,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(124,58,237,0.35)',
        }}
      >
        <span style={{ fontSize: 36 }}>🏪</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 28,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Invoeazy
      </motion.div>
      <motion.div
        className="spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />
    </div>
  );
}

export default function App() {
  // Simple router for public pages
  if (window.location.pathname === '/bill') {
    return <BillViewerScreen />;
  }

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
