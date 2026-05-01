import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Pencil, Trash2, Package, ChevronRight,
  X, Check, Tag, Ruler, IndianRupee, Filter
} from 'lucide-react';
import { useApp, UNIT_OPTIONS } from '../context/AppContext';
import toast from 'react-hot-toast';
import './ProductManager.css';

const listVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  },
};

const itemVariant = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function ProductManagerScreen() {
  const { products, addProduct, editProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showSheet, setShowSheet] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({ name: '', price: '', unit: 'piece', category: '' });
  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // Unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'All' || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', price: '', unit: 'piece', category: '' });
    setShowSheet(true);
  };

  const openEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      unit: product.unit,
      category: product.category || '',
    });
    setShowSheet(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Enter a valid price');
    if (Number(form.price) < 0) return toast.error('Price must be positive');

    const productData = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      unit: form.unit,
      category: form.category.trim() || 'General',
    };

    if (editId) {
      editProduct(editId, productData);
      toast.success('Product updated ✓');
    } else {
      addProduct(productData);
      toast.success('Product added ✓');
    }
    setShowSheet(false);
  };

  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = () => {
    deleteProduct(deleteId);
    setDeleteId(null);
    toast.success('Product removed');
  };

  return (
    <div className="pm-screen">
      {/* Header */}
      <div className="app-header">
        <div className="header-inner">
          <div>
            <h2 className="header-title">Products</h2>
            <p className="header-subtitle">{products.length} items in your list</p>
          </div>
          <motion.button
            className="btn btn-primary btn-sm"
            onClick={openAdd}
            whileTap={{ scale: 0.93 }}
          >
            <Plus size={16} />
            Add Item
          </motion.button>
        </div>
      </div>

      <div className="page">
        <div className="page-content">
          {/* Search */}
          <motion.div
            className="search-bar"
            style={{ margin: '16px 0 12px' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Search size={17} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
                <X size={15} />
              </button>
            )}
          </motion.div>

          {/* Category Filter */}
          <motion.div
            className="cat-filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-chip ${filterCat === cat ? 'active' : ''}`}
                onClick={() => setFilterCat(cat)}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Product List */}
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">
                  <Package size={32} />
                </div>
                <h3>No products found</h3>
                <p>{search ? 'Try a different search' : 'Add your first product to get started'}</p>
                {!search && (
                  <button className="btn btn-primary btn-sm" onClick={openAdd}>
                    <Plus size={15} />
                    Add Product
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="product-list"
                variants={listVariants}
                initial="initial"
                animate="animate"
              >
                {filtered.map(product => (
                  <motion.div
                    key={product.id}
                    className="product-item"
                    variants={itemVariant}
                    layout
                    exit="exit"
                  >
                    <div className="product-icon">
                      <Package size={20} />
                    </div>

                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-meta">
                        <span className="chip chip-muted">{product.unit}</span>
                        {product.category && (
                          <span className="chip chip-primary">{product.category}</span>
                        )}
                      </div>
                    </div>

                    <div className="product-price">
                      <span className="price-label">₹</span>
                      <span className="price-value">{product.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="product-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => confirmDelete(product.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add/Edit Bottom Sheet */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowSheet(false)}
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
                <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setShowSheet(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Tag size={16} /></span>
                  <input
                    className="form-input"
                    placeholder="e.g. Basmati Rice"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Price (₹) *</label>
                  <div className="form-input-icon">
                    <span className="input-icon"><IndianRupee size={16} /></span>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={e => update('price', e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    value={form.unit}
                    onChange={e => update('unit', e.target.value)}
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="form-input-icon">
                  <span className="input-icon"><Filter size={16} /></span>
                  <input
                    className="form-input"
                    placeholder="e.g. Grains, Dairy, Spices"
                    value={form.category}
                    onChange={e => update('category', e.target.value)}
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <motion.button
                className="btn btn-primary btn-full"
                style={{ marginTop: 8 }}
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
              >
                <Check size={17} />
                {editId ? 'Save Changes' : 'Add Product'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
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
              style={{ padding: '8px 24px 36px' }}
            >
              <div className="sheet-handle" />
              <div className="delete-confirm">
                <div className="delete-icon">
                  <Trash2 size={26} />
                </div>
                <h3>Remove Product?</h3>
                <p>This product will be removed from your list.</p>
                <div className="delete-actions">
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, border: '2px solid var(--border)' }}
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    onClick={handleDelete}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
