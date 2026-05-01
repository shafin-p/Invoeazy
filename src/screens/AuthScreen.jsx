import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Store, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import './Auth.css';

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }),
};

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // login | register
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { demoLogin } = useApp();

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '',
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password,
      });
      if (error) throw error;
      toast.success('Welcome back! 👋');
    } catch (err) {
      toast.error(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (error) throw error;
      toast.success('Account created! Check your email ✉️');
      setMode('login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Background Orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      {/* Logo Section */}
      <motion.div
        className="auth-logo-section"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="auth-logo">
          <Store size={28} />
        </div>
        <h1 className="auth-brand">Invoeazy</h1>
        <p className="auth-tagline">Smart billing for every shop</p>
      </motion.div>

      {/* Tab Switcher */}
      <motion.div
        className="auth-tabs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <button
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          Sign In
        </button>
        <button
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
        <div className={`auth-tab-indicator ${mode === 'register' ? 'right' : ''}`} />
      </motion.div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onSubmit={mode === 'login' ? handleLogin : handleRegister}
          className="auth-form"
        >
          {mode === 'register' && (
            <motion.div custom={0} variants={itemVariants} initial="initial" animate="animate" className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input-icon">
                <span className="input-icon"><Store size={17} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  autoComplete="name"
                />
              </div>
            </motion.div>
          )}

          <motion.div custom={mode === 'register' ? 1 : 0} variants={itemVariants} initial="initial" animate="animate" className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-icon">
              <span className="input-icon"><Mail size={17} /></span>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                autoComplete="email"
              />
            </div>
          </motion.div>

          <motion.div custom={mode === 'register' ? 2 : 1} variants={itemVariants} initial="initial" animate="animate" className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-icon">
              <span className="input-icon"><Lock size={17} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                style={{ paddingRight: '46px' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(s => !s)}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </motion.div>

          {mode === 'register' && (
            <motion.div custom={3} variants={itemVariants} initial="initial" animate="animate" className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-icon">
                <span className="input-icon"><Lock size={17} /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </motion.div>
          )}

          {mode === 'login' && (
            <motion.div custom={2} variants={itemVariants} initial="initial" animate="animate">
              <button type="button" className="forgot-link">Forgot password?</button>
            </motion.div>
          )}

          <motion.button
            custom={mode === 'register' ? 4 : 3}
            variants={itemVariants}
            initial="initial"
            animate="animate"
            type="submit"
            className="btn btn-primary btn-full auth-submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </motion.form>
      </AnimatePresence>

      {/* Divider */}
      <motion.div
        className="auth-divider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span>or</span>
      </motion.div>

    </div>
  );
}
