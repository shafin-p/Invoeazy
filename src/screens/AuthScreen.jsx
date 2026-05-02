import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Store, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

// Friendly error messages for common Supabase errors
function getFriendlyError(err) {
  const msg = err?.message || '';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
    return 'No internet connection. Please check your network and try again.';
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. Please try again.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please verify your email before signing in. Check your inbox.';
  }
  if (msg.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return msg || 'Something went wrong. Please try again.';
}

export default function AuthScreen() {
  // mode: 'login' | 'register' | 'otp'
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '',
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      toast.success('Welcome back! 👋');
    } catch (err) {
      toast.error(getFriendlyError(err));
      setLoading(false);
    }
  };

  // --- REGISTER (sends OTP) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.name.trim() } },
      });
      if (error) throw error;
      setPendingEmail(form.email.trim());
      setMode('otp');
      toast.success('Verification code sent to your email! ✉️');
      startResendCooldown();
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Please enter the 6-digit code from your email.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otp.trim(),
        type: 'signup',
      });
      if (error) throw error;
      toast.success('Email verified! Welcome to Invoeazy 🎉');
    } catch (err) {
      toast.error(getFriendlyError(err) || 'Invalid or expired code. Please try again.');
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error('Please enter your email.');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim());
      if (error) throw error;
      setPendingEmail(form.email.trim());
      setMode('reset-otp');
      toast.success('Password reset code sent to your email!');
      startResendCooldown();
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // --- RESET PASSWORD VERIFY ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error('Please enter the 6-digit code.');
    if (form.password.length < 6) return toast.error('New password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setLoading(true);
    try {
      // 1. Verify the OTP for password recovery
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otp.trim(),
        type: 'recovery',
      });
      if (error) throw error;
      
      // 2. We now have a session, update the password
      const { error: updateError } = await supabase.auth.updateUser({ password: form.password });
      if (updateError) throw updateError;

      toast.success('Password reset successfully! 🎉');
      setMode('login');
      setOtp('');
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(getFriendlyError(err) || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      // Different type based on mode
      const type = mode === 'reset-otp' ? 'recovery' : 'signup';
      const { error } = await supabase.auth.resend({
        type: type,
        email: pendingEmail,
      });
      if (error) throw error;
      toast.success('A new code has been sent to your email.');
      startResendCooldown();
    } catch (err) {
      toast.error(getFriendlyError(err));
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="auth-screen">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      {/* Logo */}
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

      {/* === OTP VERIFICATION SCREEN (SIGNUP) === */}
      <AnimatePresence mode="wait">
        {mode === 'otp' ? (
          <motion.div
            key="otp"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-form"
          >
            <div className="otp-header">
              <div className="otp-icon-wrap">
                <ShieldCheck size={32} color="#7C3AED" />
              </div>
              <h3 className="otp-title">Verify Your Email</h3>
              <p className="otp-desc">
                We sent a secure code to <strong>{pendingEmail}</strong>. Enter it below to activate your account.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <input
                  className="form-input otp-input"
                  type="number"
                  placeholder="000000"
                  maxLength={8}
                  value={otp}
                  onChange={e => setOtp(e.target.value.slice(0, 8))}
                  autoFocus
                  style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 8 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                ) : (
                  <><ShieldCheck size={18} /> Verify & Continue</>
                )}
              </button>
            </form>

            <div className="otp-resend-row">
              <span>Didn't receive it?</span>
              <button
                className="otp-resend-btn"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? (
                  <><RefreshCw size={13} /> Resend in {resendCooldown}s</>
                ) : (
                  <><RefreshCw size={13} /> Resend Code</>
                )}
              </button>
            </div>

            <button
              className="otp-back-btn"
              onClick={() => { setMode('register'); setOtp(''); }}
            >
              ← Go back
            </button>
          </motion.div>
        ) : mode === 'forgot-password' ? (
          <motion.div
            key="forgot"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-form"
          >
            <div className="otp-header">
              <div className="otp-icon-wrap">
                <Lock size={32} color="#7C3AED" />
              </div>
              <h3 className="otp-title">Reset Password</h3>
              <p className="otp-desc">
                Enter your email address and we'll send you a secure code to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
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
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                ) : (
                  <><ShieldCheck size={18} /> Send Reset Code</>
                )}
              </button>
            </form>

            <button
              className="otp-back-btn"
              onClick={() => setMode('login')}
            >
              ← Back to Sign In
            </button>
          </motion.div>
        ) : mode === 'reset-otp' ? (
           <motion.div
            key="reset-otp"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="auth-form"
          >
            <div className="otp-header" style={{ marginBottom: 16 }}>
              <h3 className="otp-title">Enter Code & New Password</h3>
              <p className="otp-desc">
                Code sent to <strong>{pendingEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <input
                  className="form-input otp-input"
                  type="number"
                  placeholder="000000"
                  maxLength={8}
                  value={otp}
                  onChange={e => setOtp(e.target.value.slice(0, 8))}
                  autoFocus
                  style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, letterSpacing: 8, padding: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <div className="form-input-icon">
                  <span className="input-icon"><Lock size={17} /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="New Password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    style={{ paddingRight: '46px' }}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="form-input-icon">
                  <span className="input-icon"><Lock size={17} /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm New Password"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                {loading ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : 'Reset Password'}
              </button>
            </form>

            <div className="otp-resend-row">
              <button className="otp-resend-btn" onClick={handleResendOtp} disabled={resendCooldown > 0}>
                {resendCooldown > 0 ? <><RefreshCw size={13} /> Resend in {resendCooldown}s</> : <><RefreshCw size={13} /> Resend Code</>}
              </button>
            </div>
            <button className="otp-back-btn" onClick={() => setMode('forgot-password')}>
              ← Go back
            </button>
          </motion.div>
        ) : (
          <>
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

            {/* Login / Register Form */}
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
                    <button type="button" className="forgot-link" onClick={() => { setMode('forgot-password'); setForm({ ...form, email: '' }); }}>Forgot password?</button>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
