import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Minus, X, Check, Search, IndianRupee, QrCode, 
  Receipt, User, Phone, Trash2, BookOpen
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import './BillingScreen.css';

export default function BillingScreen() {
  const { products, addBill, shop, khata, addKhataCustomer, updateKhataCustomer } = useApp();
  
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isKhata, setIsKhata] = useState(false);
  
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [search, setSearch] = useState('');
  
  const [generatedBill, setGeneratedBill] = useState(null);

  // Qty selection modal
  const [qtyModal, setQtyModal] = useState(null);
  const [inputQty, setInputQty] = useState('');
  const [inputUnit, setInputUnit] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const getSubUnits = (baseUnit) => {
    switch(baseUnit) {
      case 'kg': return ['kg', 'gram'];
      case 'litre': return ['litre', 'ml'];
      case 'strip': return ['strip', 'piece'];
      case 'box': return ['box', 'piece'];
      case 'dozen': return ['dozen', 'piece'];
      default: return [baseUnit];
    }
  };

  const openQtyModal = (product) => {
    setQtyModal(product);
    setInputQty('1');
    setInputUnit(product.unit);
  };

  const confirmAddProduct = () => {
    const amount = Number(inputQty);
    if (!amount || amount <= 0) return toast.error('Enter a valid quantity');
    
    const product = qtyModal;
    let finalQty = amount;
    
    // convert if necessary to calculate price
    if (product.unit === 'kg' && inputUnit === 'gram') finalQty = amount / 1000;
    else if (product.unit === 'litre' && inputUnit === 'ml') finalQty = amount / 1000;
    else if (product.unit === 'strip' && inputUnit === 'piece') finalQty = amount / 10; // assuming 10 pieces/strip
    else if (product.unit === 'box' && inputUnit === 'piece') finalQty = amount / 10; // assuming 10 pieces/box
    else if (product.unit === 'dozen' && inputUnit === 'piece') finalQty = amount / 12;

    const itemTotal = product.price * finalQty;
    
    const existing = cart.find(i => i.productId === product.id && i.displayUnit === inputUnit);
    
    if (existing) {
      const newDisplayQty = existing.displayQty + amount;
      const newMultiplier = existing.qtyMultiplier + finalQty;
      setCart(cart.map(i => i.id === existing.id ? {
        ...i,
        displayQty: newDisplayQty,
        qtyMultiplier: newMultiplier,
        total: product.price * newMultiplier
      } : i));
    } else {
      const newItem = {
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        baseUnit: product.unit,
        displayQty: amount,
        displayUnit: inputUnit,
        qtyMultiplier: finalQty,
        total: itemTotal
      };
      setCart([...cart, newItem]);
    }
    
    setQtyModal(null);
    setShowProductSheet(false);
    toast.success(`Added ${product.name}`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setIsKhata(false);
  };

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const generateQRBill = () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (isKhata && !customerName.trim()) {
      return toast.error('Customer Name is required for Khata');
    }
    
    const billId = uuidv4();
    const date = new Date().toISOString();
    
    const billData = {
      id: billId,
      date,
      items: [...cart],
      total: cartTotal,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      isKhata,
      shopName: shop?.name || 'Invoeazy Shop',
    };

    // Encode minimal bill data to keep URL short
    const compactData = {
      id: billId,
      date,
      total: cartTotal,
      customerName: customerName.trim(),
      shopName: shop?.name || 'Invoeazy Shop',
      isKhata,
      items: cart.map(i => ({ name: i.name, displayQty: i.displayQty, displayUnit: i.displayUnit, total: i.total }))
    };
    
    // Create base64 URL-safe string
    const encodedData = btoa(JSON.stringify(compactData));
    const qrUrl = `${window.location.origin}/bill?data=${encodedData}`;
    billData.qrUrl = qrUrl;

    if (isKhata) {
      const nameMatch = customerName.trim().toLowerCase();
      let customer = khata.find(c => c.name.toLowerCase() === nameMatch);
      
      if (!customer) {
        customer = {
          id: uuidv4(),
          name: customerName.trim(),
          phone: customerPhone.trim(),
          balance: 0,
          transactions: []
        };
        addKhataCustomer(customer);
      }
      
      const tx = {
        id: uuidv4(),
        date,
        type: 'credit',
        amount: cartTotal,
        note: `Bill #${billId.substring(0,6)}`
      };
      
      const updatedCustomer = {
        ...customer,
        balance: customer.balance + cartTotal,
        transactions: [tx, ...customer.transactions]
      };
      
      updateKhataCustomer(customer.id, updatedCustomer);
      toast.success('Added to Khata!');
    } else {
      toast.success('Bill generated successfully! 🎉');
    }

    addBill(billData);
    setGeneratedBill(billData);
  };

  return (
    <div className="billing-screen">
      <div className="app-header">
        <div className="header-inner">
          <div>
            <h2 className="header-title">New Bill</h2>
            <p className="header-subtitle">Create a QR Invoice</p>
          </div>
          {cart.length > 0 && (
            <button className="btn btn-ghost btn-sm text-danger" onClick={clearCart}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="page">
        <div className="page-content" style={{ paddingBottom: 160 }}>
          
          {/* Customer Details */}
          <div className="card customer-card">
            <div className="form-group" style={{ marginBottom: 12 }}>
              <div className="form-input-icon">
                <span className="input-icon"><User size={16} /></span>
                <input 
                  className="form-input" 
                  placeholder={isKhata ? "Customer Name (Required)" : "Customer Name (Optional)"}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <div className="form-input-icon">
                <span className="input-icon"><Phone size={16} /></span>
                <input 
                  className="form-input" 
                  placeholder="Phone Number (Optional)" 
                  type="tel"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            
            <label className="khata-toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
              <input 
                type="checkbox" 
                checked={isKhata}
                onChange={e => setIsKhata(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} className="text-danger" /> Add to Khata (Credit)
              </span>
            </label>
          </div>

          <div className="section-heading" style={{ marginTop: 20 }}>
            <h3>Items ({cart.length})</h3>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowProductSheet(true)}
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-icon" style={{ width: 60, height: 60 }}>
                <Receipt size={24} />
              </div>
              <p>No items added yet</p>
            </div>
          ) : (
            <div className="cart-list">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="cart-item"
                  >
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">
                        {item.displayQty} {item.displayUnit} @ ₹{item.basePrice}/{item.baseUnit}
                      </div>
                    </div>
                    
                    <div className="cart-item-controls">
                      <div className="cart-item-total">
                        ₹{item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <button className="action-btn delete" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Sticky Total Bar */}
      <div className="billing-footer">
        <div className="total-row">
          <span className="total-label">Total Amount</span>
          <span className="total-value">₹{cartTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        <button 
          className="btn btn-primary btn-full generate-btn"
          disabled={cart.length === 0}
          onClick={generateQRBill}
        >
          <QrCode size={18} />
          Generate QR Bill
        </button>
      </div>

      {/* Select Products Bottom Sheet */}
      <AnimatePresence>
        {showProductSheet && (
          <motion.div 
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowProductSheet(false)}
          >
            <motion.div 
              className="bottom-sheet product-selector-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="sheet-handle" />
              <div className="sheet-header" style={{ marginBottom: 12 }}>
                <h3>Add Products</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowProductSheet(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="search-bar" style={{ marginBottom: 16 }}>
                <Search size={17} />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                />
              </div>

              <div className="selector-list">
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-muted" style={{ padding: 20 }}>
                    No products found. Add them in the Product Manager.
                  </div>
                ) : (
                  filteredProducts.map(p => (
                    <div key={p.id} className="selector-item" onClick={() => openQtyModal(p)}>
                      <div className="selector-info">
                        <div className="selector-name">{p.name}</div>
                        <div className="selector-meta">₹{p.price} / {p.unit}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                        <Plus size={14} /> Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quantity & Unit Selection Modal */}
      <AnimatePresence>
        {qtyModal && (
          <motion.div 
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bill-modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              style={{ padding: '24px 20px' }}
            >
              <div className="bill-modal-header" style={{ marginBottom: 16 }}>
                <h3>Quantity</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setQtyModal(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ width: '100%', marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{qtyModal.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Base price: ₹{qtyModal.price} / {qtyModal.unit}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, width: '100%', marginBottom: 24 }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Qty</label>
                  <input 
                    className="form-input" 
                    type="number"
                    step="any"
                    value={inputQty}
                    onChange={e => setInputQty(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Unit</label>
                  <select 
                    className="form-input"
                    value={inputUnit}
                    onChange={e => setInputUnit(e.target.value)}
                  >
                    {getSubUnits(qtyModal.unit).map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="btn btn-primary btn-full" onClick={confirmAddProduct}>
                Add to Bill
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Bill Modal */}
      <AnimatePresence>
        {generatedBill && (
          <motion.div 
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bill-modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
            >
              <div className="bill-modal-header">
                <h3>Bill Generated!</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => {
                  setGeneratedBill(null);
                  clearCart();
                }}>
                  <X size={20} />
                </button>
              </div>

              <div className="qr-container">
                <div className="qr-box">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedBill.qrUrl)}`} 
                    alt="QR Code" 
                    width={180} 
                    height={180} 
                  />
                </div>
                <p className="qr-hint">Scan to view & save the digital bill</p>
                <div className="qr-timer">
                  <ClockIcon /> Link expires in 15 mins
                </div>
              </div>

              <div className="bill-summary">
                <div className="summary-row">
                  <span className="text-muted">Total Items</span>
                  <span className="font-semibold">{generatedBill.items.length}</span>
                </div>
                <div className="summary-row">
                  <span className="text-muted">Amount</span>
                  <span className="font-bold text-primary-color" style={{ fontSize: 18 }}>
                    ₹{generatedBill.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                {generatedBill.isKhata && (
                  <div className="summary-row" style={{ marginTop: 8 }}>
                    <span className="text-danger font-bold">Added to Khata</span>
                    <span className="font-semibold text-danger">{generatedBill.customerName}</span>
                  </div>
                )}
              </div>

              <button 
                className="btn btn-secondary btn-full"
                onClick={() => {
                  setGeneratedBill(null);
                  clearCart();
                }}
              >
                Create New Bill
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}
