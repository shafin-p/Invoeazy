import { useEffect, useState } from 'react';
import { IndianRupee, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import './BillViewerScreen.css';

export default function BillViewerScreen() {
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const dataParam = searchParams.get('data') || searchParams.get('billData');
      if (!dataParam) throw new Error('No bill data found in link.');

      // Decode safely (handles Unicode characters like ₹)
      const decoded = JSON.parse(decodeURIComponent(escape(atob(dataParam))));
      setBill(decoded);
    } catch (err) {
      setError('Invalid or corrupted bill link. Please ask the shop to re-generate the bill.');
    }
  }, []);

  if (error) {
    return (
      <div className="bill-viewer-error">
        <div className="error-box">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!bill) return <div className="bill-viewer-loading">Loading Bill...</div>;

  return (
    <div className="bill-viewer-container">
      <div className="bill-card">
        <div className="bill-header">
          <div className="success-icon">
            <CheckCircle2 size={48} color="var(--success)" />
          </div>
          <h2>{bill.shopName || 'Invoice'}</h2>
          <p className="bill-subtitle">Thank you for your purchase!</p>
        </div>

        <div className="bill-meta">
          <div className="meta-row">
            <span className="meta-label">Bill No:</span>
            <span className="meta-value">#{bill.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{new Date(bill.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          {bill.customerName && (
            <div className="meta-row">
              <span className="meta-label">Customer:</span>
              <span className="meta-value">{bill.customerName}</span>
            </div>
          )}
        </div>

        <div className="bill-items">
          <div className="items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          
          {bill.items.map((item, idx) => (
            <div key={idx} className="item-row">
              <div className="item-name">{item.name}</div>
              <div className="item-qty">{item.displayQty} {item.displayUnit}</div>
              <div className="item-price">₹{item.total.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        <div className="bill-total-section">
          <div className="total-row">
            <span>Total Amount</span>
            <span className="total-price">₹{bill.total.toLocaleString('en-IN')}</span>
          </div>
          {bill.isKhata && (
            <div className="khata-badge">Added to Khata Credit</div>
          )}
        </div>

        <div className="bill-footer">
          <p>This is a computer generated digital invoice.</p>
          <p>Powered by <strong>Invoeazy</strong></p>
        </div>
      </div>
      
      {/* Floating Download Button */}
      <button 
        className="btn btn-primary"
        onClick={async () => {
          try {
            const html2canvas = (await import('html2canvas')).default;
            const element = document.querySelector('.bill-card');
            
            // Add a temporary class to ensure rendering is perfect before capture
            element.style.borderRadius = '0';
            element.style.margin = '0';
            
            const canvas = await html2canvas(element, {
              scale: 2, // High quality
              useCORS: true,
              backgroundColor: '#ffffff'
            });
            
            // Restore styles
            element.style.borderRadius = '';
            element.style.margin = '';
            
            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `Invoice_${bill.shopName.replace(/\s+/g, '_')}_${bill.id.substring(0, 6)}.png`;
            link.href = image;
            link.click();
          } catch (err) {
            console.error('Failed to download receipt:', err);
            alert('Failed to download receipt. Please try taking a screenshot instead.');
          }
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '380px',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 100
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Receipt
      </button>
      
      {/* Spacer so button doesn't cover content */}
      <div style={{ height: 100 }}></div>
    </div>
  );
}
