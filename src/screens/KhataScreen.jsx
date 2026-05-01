import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, User, Phone, Search, ChevronRight, 
  ArrowUpRight, ArrowDownLeft, X, Check, IndianRupee 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import './KhataScreen.css';

export default function KhataScreen() {
  const { khata, addKhataCustomer, updateKhataCustomer } = useApp();
  const [search, setSearch] = useState('');
  
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Transaction sheet
  const [showTxSheet, setShowTxSheet] = useState(false);
  const [txType, setTxType] = useState('credit'); // 'credit' | 'payment'
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  const filteredKhata = useMemo(() => {
    if (!search) return khata;
    return khata.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search)
    );
  }, [khata, search]);

  const handleAddCustomer = () => {
    if (!customerName.trim()) return toast.error('Name is required');
    const newCustomer = {
      id: uuidv4(),
      name: customerName.trim(),
      phone: customerPhone.trim(),
      balance: 0,
      transactions: []
    };
    addKhataCustomer(newCustomer);
    setShowAddCustomer(false);
    setCustomerName('');
    setCustomerPhone('');
    toast.success('Customer added');
  };

  const handleAddTx = () => {
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      return toast.error('Enter valid amount');
    }
    
    const amount = Number(txAmount);
    const tx = {
      id: uuidv4(),
      date: new Date().toISOString(),
      type: txType,
      amount: amount,
      note: txNote.trim()
    };

    // calculate new balance
    // balance > 0 means customer owes us (credit)
    let newBalance = selectedCustomer.balance;
    if (txType === 'credit') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    const updatedCustomer = {
      ...selectedCustomer,
      balance: newBalance,
      transactions: [tx, ...selectedCustomer.transactions]
    };

    updateKhataCustomer(selectedCustomer.id, updatedCustomer);
    setSelectedCustomer(updatedCustomer); // update local view
    
    setShowTxSheet(false);
    setTxAmount('');
    setTxNote('');
    toast.success('Transaction added');
  };

  const totalCredit = khata.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

  // If a customer is selected, show their details
  if (selectedCustomer) {
    return (
      <div className="khata-screen">
        <div className="app-header">
          <div className="header-inner">
            <div>
              <h2 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  className="btn-ghost btn-icon" 
                  style={{ padding: 4, width: 'auto', height: 'auto', marginLeft: -8 }}
                  onClick={() => setSelectedCustomer(null)}
                >
                  <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                </button>
                {selectedCustomer.name}
              </h2>
              <p className="header-subtitle">{selectedCustomer.phone || 'No phone number'}</p>
            </div>
          </div>
        </div>

        <div className="page" style={{ paddingBottom: 100 }}>
          <div className="page-content" style={{ paddingTop: 16 }}>
            <div className={`balance-card ${selectedCustomer.balance === 0 ? 'settled' : ''}`}>
              <div className="balance-label">Current Balance</div>
              <div className="balance-amount">
                ₹{Math.abs(selectedCustomer.balance).toLocaleString('en-IN')}
              </div>
              <div className="balance-status">
                {selectedCustomer.balance > 0 ? 'Customer Owes You' : 
                 selectedCustomer.balance < 0 ? 'You Owe Customer' : 'Settled'}
              </div>
            </div>

            <div className="tx-actions">
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { setTxType('credit'); setShowTxSheet(true); }}>
                <ArrowUpRight size={16} /> Give Credit
              </button>
              <button className="btn btn-success" style={{ flex: 1 }} onClick={() => { setTxType('payment'); setShowTxSheet(true); }}>
                <ArrowDownLeft size={16} /> Payment Received
              </button>
            </div>

            <div className="section-heading" style={{ marginTop: 24 }}>
              <h3>Transactions</h3>
            </div>

            {selectedCustomer.transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="tx-list">
                {selectedCustomer.transactions.map(tx => (
                  <div key={tx.id} className="tx-item">
                    <div className={`tx-icon ${tx.type}`}>
                      {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div className="tx-info">
                      <div className="tx-note">{tx.note || (tx.type === 'credit' ? 'Credit Given' : 'Payment Received')}</div>
                      <div className="tx-date">{new Date(tx.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction Bottom Sheet */}
        <AnimatePresence>
          {showTxSheet && (
            <motion.div 
              className="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bottom-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="sheet-handle" />
                <div className="sheet-header">
                  <h3>{txType === 'credit' ? 'Give Credit' : 'Payment Received'}</h3>
                  <button className="btn btn-ghost btn-icon" onClick={() => setShowTxSheet(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><IndianRupee size={16} /></span>
                    <input 
                      className="form-input" 
                      type="number"
                      placeholder="0.00"
                      value={txAmount}
                      onChange={e => setTxAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Details / Note</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Rice and Dal"
                    value={txNote}
                    onChange={e => setTxNote(e.target.value)}
                  />
                </div>

                <button 
                  className={`btn btn-full ${txType === 'credit' ? 'btn-danger' : 'btn-success'}`}
                  style={{ marginTop: 8 }}
                  onClick={handleAddTx}
                >
                  <Check size={18} /> Save Entry
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Main Khata List View
  return (
    <div className="khata-screen">
      <div className="app-header">
        <div className="header-inner">
          <div>
            <h2 className="header-title">Khata Book</h2>
            <p className="header-subtitle">Manage customer credit</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddCustomer(true)}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="page">
        <div className="page-content">
          
          <div className="khata-summary">
            <div className="ks-label">Total Outstanding Credit</div>
            <div className="ks-val">₹{totalCredit.toLocaleString('en-IN')}</div>
          </div>

          <div className="search-bar" style={{ margin: '16px 0' }}>
            <Search size={17} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
            />
          </div>

          {khata.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 20 }}>
              <div className="empty-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <BookOpen size={24} />
              </div>
              <h3>No Customers Yet</h3>
              <p>Add a customer to start tracking credit.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddCustomer(true)}>
                <Plus size={15} /> Add Customer
              </button>
            </div>
          ) : (
            <div className="customer-list">
              {filteredKhata.map(c => (
                <div key={c.id} className="list-item" onClick={() => setSelectedCustomer(c)}>
                  <div className="avatar avatar-md">{c.name.charAt(0).toUpperCase()}</div>
                  <div className="list-item-content">
                    <div className="list-item-title">{c.name}</div>
                    <div className="list-item-subtitle">{c.phone || 'No phone'}</div>
                  </div>
                  <div className="khata-balance-preview">
                    {c.balance > 0 ? (
                      <span className="text-danger font-bold">₹{c.balance}</span>
                    ) : c.balance < 0 ? (
                      <span className="text-success font-bold">Adv: ₹{Math.abs(c.balance)}</span>
                    ) : (
                      <span className="text-muted">Settled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Add Customer Bottom Sheet */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div 
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className="sheet-handle" />
              <div className="sheet-header">
                <h3>New Customer</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowAddCustomer(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <div className="form-input-icon">
                  <span className="input-icon"><User size={16} /></span>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Ramesh"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Phone size={16} /></span>
                  <input 
                    className="form-input" 
                    type="tel"
                    maxLength={10}
                    placeholder="Optional"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleAddCustomer}>
                <Check size={18} /> Add Customer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
