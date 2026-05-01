import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, AlignLeft, Type, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import './BillDesignerScreen.css';

export default function BillDesignerScreen({ onBack }) {
  const [theme, setTheme] = useState('modern');
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [font, setFont] = useState('Inter');

  const handleSave = () => {
    // In a real app, save to AppContext / Supabase
    toast.success('Bill design updated successfully!');
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  return (
    <div className="designer-screen">
      <div className="app-header">
        <div className="header-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="header-title">Bill Designer</h2>
            <p className="header-subtitle">Customize your receipts</p>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="page-content" style={{ paddingBottom: 120 }}>
          
          <div className="card designer-card">
            <h3 className="section-title"><Palette size={18} /> Accent Color</h3>
            <div className="color-picker-grid">
              {['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#1F2937'].map(color => (
                <button
                  key={color}
                  className={`color-blob ${primaryColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="card designer-card">
            <h3 className="section-title"><Type size={18} /> Typography</h3>
            <select 
              className="form-input" 
              value={font} 
              onChange={e => setFont(e.target.value)}
            >
              <option value="Inter">Inter (Modern & Clean)</option>
              <option value="Sora">Sora (Bold & Playful)</option>
              <option value="Roboto">Roboto (Classic Android)</option>
              <option value="monospace">Monospace (Retro Receipt)</option>
            </select>
          </div>

          <div className="card designer-card">
            <h3 className="section-title"><AlignLeft size={18} /> Receipt Theme</h3>
            <div className="theme-options">
              <label className={`theme-card ${theme === 'modern' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="modern"
                  checked={theme === 'modern'}
                  onChange={() => setTheme('modern')}
                  style={{ display: 'none' }}
                />
                <div className="theme-preview" style={{ borderRadius: 8, border: '1px solid #E5E7EB', padding: 10 }}>
                  <div style={{ width: '40%', height: 4, background: '#E5E7EB', marginBottom: 4 }} />
                  <div style={{ width: '100%', height: 12, background: '#F3F4F6', borderRadius: 4 }} />
                </div>
                <span>Modern Clean</span>
              </label>

              <label className={`theme-card ${theme === 'classic' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="theme" 
                  value="classic"
                  checked={theme === 'classic'}
                  onChange={() => setTheme('classic')}
                  style={{ display: 'none' }}
                />
                <div className="theme-preview" style={{ borderRadius: 0, borderTop: '2px dashed #E5E7EB', padding: 10 }}>
                  <div style={{ width: '40%', height: 4, background: '#E5E7EB', marginBottom: 4, textAlign: 'center', margin: '0 auto 4px auto' }} />
                  <div style={{ width: '100%', height: 12, background: '#F3F4F6' }} />
                </div>
                <span>Classic Thermal</span>
              </label>
            </div>
          </div>

          <div className="card designer-card">
            <h3 className="section-title"><ImageIcon size={18} /> Shop Logo</h3>
            <div className="upload-area">
              <div className="upload-icon">
                <ImageIcon size={24} color="#9CA3AF" />
              </div>
              <p>Tap to upload logo</p>
              <span className="upload-hint">PNG or JPG, max 1MB</span>
            </div>
          </div>

        </div>
      </div>

      <div className="billing-footer" style={{ borderTop: 'none', background: 'transparent' }}>
        <button className="btn btn-primary btn-full" onClick={handleSave}>
          Save Design
        </button>
      </div>
    </div>
  );
}
