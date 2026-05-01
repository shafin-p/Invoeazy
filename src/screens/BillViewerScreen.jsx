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
      
      const decoded = JSON.parse(atob(dataParam));
      setBill(decoded);
    } catch (err) {
      setError('Invalid or corrupted bill link.');
    }
  }, [searchParams]);

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
    </div>
  );
}
