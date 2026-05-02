import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Mail, PhoneCall, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const FAQS = [
  {
    q: "How do I add a product that isn't in my list?",
    a: "While making a bill, simply type the product name in the search bar. If it's not found, click 'Add Custom Item' to instantly add it to the bill and your permanent inventory."
  },
  {
    q: "What is Khata and how does it work?",
    a: "Khata is your digital credit book. When creating a bill, toggle 'Add to Khata'. The amount is added to that customer's pending balance, which you can track in the Khata tab."
  },
  {
    q: "Do I need internet to generate bills?",
    a: "No! Invoeazy works completely offline. You can generate bills, add products, and manage Khata without internet. The QR codes will also generate perfectly."
  },
  {
    q: "How does the QR bill feature work?",
    a: "When you finish a bill, a QR code appears. Your customer can open their phone camera, scan it, and view a beautiful digital receipt instantly. No app required for them!"
  },
  {
    q: "Can I add my shop logo to the bills?",
    a: "Yes! Go to the 'Design' button on the Home screen to customize your bill's colors, themes, and upload your shop logo."
  }
];

export default function HelpScreen({ onBack }) {
  const { user } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return toast.error('Please write something first.');
    setSending(true);
    
    try {
      const { error } = await supabase.from('feedback').insert([{
        message: feedback.trim(),
        user_email: user?.email || 'demo_user'
      }]);
      
      if (error) throw error;
      
      setFeedback('');
      toast.success('Feedback sent! Thank you.');
    } catch (err) {
      toast.error('Failed to send feedback. Try again later.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="help-screen" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)' }}>
      <div className="app-header">
        <div className="header-inner">
          <button className="icon-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="header-title">Help & Support</h2>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div className="page-content" style={{ padding: 20, overflowY: 'auto' }}>
        
        {/* Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div className="contact-card" onClick={() => toast('Email support coming soon!')}>
            <div className="contact-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
              <Mail size={20} />
            </div>
            <h4>Email Us</h4>
            <p>support@invoeazy.com</p>
          </div>
          <div className="contact-card" onClick={() => toast('Phone support coming soon!')}>
            <div className="contact-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
              <PhoneCall size={20} />
            </div>
            <h4>Call Us</h4>
            <p>Mon-Fri, 9am-6pm</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <HelpCircle size={18} color="var(--primary)" /> Frequently Asked Questions
          </h3>
        </div>
        
        <div className="faq-list" style={{ marginBottom: 32 }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} className="faq-item" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 8, overflow: 'hidden' }}>
              <button 
                className="faq-question" 
                onClick={() => toggleFaq(idx)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                {faq.q}
                {openFaq === idx ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </button>
              
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ padding: '0 16px 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="section-heading" style={{ marginBottom: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={18} color="#10B981" /> Send Feedback
          </h3>
        </div>
        
        <form onSubmit={handleFeedbackSubmit} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Found a bug or have a feature request? Let us know below!
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type your message here..."
            style={{ width: '100%', height: 100, padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, resize: 'none', marginBottom: 12, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
            {sending ? <div className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Send Message'}
          </button>
        </form>
        
        <div style={{ height: 40 }} />
      </div>

      <style>{`
        .contact-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: transform var(--duration-fast);
        }
        .contact-card:active {
          transform: scale(0.97);
        }
        .contact-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
        }
        .contact-card h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .contact-card p {
          font-size: 11px;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
