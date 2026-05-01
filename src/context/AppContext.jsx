import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, getShopByOwner } from '../lib/supabase';

const AppContext = createContext(null);

// Default product catalog by shop type
const DEFAULT_PRODUCTS = {
  grocery: [
    { id: 'g1', name: 'Rice', price: 60, unit: 'kg', category: 'Grains' },
    { id: 'g2', name: 'Wheat Flour', price: 45, unit: 'kg', category: 'Grains' },
    { id: 'g3', name: 'Sugar', price: 42, unit: 'kg', category: 'Essentials' },
    { id: 'g4', name: 'Salt', price: 20, unit: 'packet', category: 'Essentials' },
    { id: 'g5', name: 'Cooking Oil', price: 150, unit: 'litre', category: 'Oils' },
    { id: 'g6', name: 'Mustard Oil', price: 180, unit: 'litre', category: 'Oils' },
    { id: 'g7', name: 'Toor Dal', price: 120, unit: 'kg', category: 'Pulses' },
    { id: 'g8', name: 'Moong Dal', price: 110, unit: 'kg', category: 'Pulses' },
    { id: 'g9', name: 'Chana Dal', price: 90, unit: 'kg', category: 'Pulses' },
    { id: 'g10', name: 'Tea Powder', price: 300, unit: 'kg', category: 'Beverages' },
    { id: 'g11', name: 'Coffee', price: 500, unit: 'kg', category: 'Beverages' },
    { id: 'g12', name: 'Milk Packet', price: 25, unit: 'packet', category: 'Dairy' },
  ],
  medical: [
    { id: 'm1', name: 'Paracetamol 500mg', price: 15, unit: 'strip', category: 'Tablets' },
    { id: 'm2', name: 'Cough Syrup', price: 85, unit: 'piece', category: 'Syrups' },
    { id: 'm3', name: 'Vitamin C', price: 120, unit: 'strip', category: 'Vitamins' },
    { id: 'm4', name: 'Antacid', price: 30, unit: 'strip', category: 'Tablets' },
    { id: 'm5', name: 'Band Aid', price: 45, unit: 'packet', category: 'First Aid' },
    { id: 'm6', name: 'Dettol Antiseptic', price: 90, unit: 'piece', category: 'First Aid' },
    { id: 'm7', name: 'Thermometer', price: 250, unit: 'piece', category: 'Devices' },
    { id: 'm8', name: 'B.P. Monitor', price: 1200, unit: 'piece', category: 'Devices' },
  ],
  restaurant: [
    { id: 'r1', name: 'Veg Thali', price: 120, unit: 'piece', category: 'Meals' },
    { id: 'r2', name: 'Non-Veg Thali', price: 160, unit: 'piece', category: 'Meals' },
    { id: 'r3', name: 'Roti', price: 10, unit: 'piece', category: 'Breads' },
    { id: 'r4', name: 'Paratha', price: 20, unit: 'piece', category: 'Breads' },
    { id: 'r5', name: 'Dal Fry', price: 80, unit: 'piece', category: 'Curries' },
    { id: 'r6', name: 'Paneer Butter Masala', price: 150, unit: 'piece', category: 'Curries' },
    { id: 'r7', name: 'Lassi', price: 40, unit: 'glass', category: 'Drinks' },
    { id: 'r8', name: 'Chai', price: 15, unit: 'glass', category: 'Drinks' },
    { id: 'r9', name: 'Cold Drink', price: 30, unit: 'bottle', category: 'Drinks' },
  ],
  electronics: [
    { id: 'e1', name: 'USB Cable', price: 150, unit: 'piece', category: 'Cables' },
    { id: 'e2', name: 'Earphones', price: 350, unit: 'piece', category: 'Audio' },
    { id: 'e3', name: 'Phone Case', price: 200, unit: 'piece', category: 'Accessories' },
    { id: 'e4', name: 'Screen Guard', price: 100, unit: 'piece', category: 'Accessories' },
    { id: 'e5', name: 'Power Bank', price: 800, unit: 'piece', category: 'Charging' },
    { id: 'e6', name: 'Charger Adapter', price: 450, unit: 'piece', category: 'Charging' },
  ],
  clothing: [
    { id: 'c1', name: 'T-Shirt', price: 299, unit: 'piece', category: 'Tops' },
    { id: 'c2', name: 'Jeans', price: 799, unit: 'piece', category: 'Bottoms' },
    { id: 'c3', name: 'Kurta', price: 499, unit: 'piece', category: 'Ethnic' },
    { id: 'c4', name: 'Saree', price: 1200, unit: 'piece', category: 'Ethnic' },
    { id: 'c5', name: 'Socks', price: 99, unit: 'pair', category: 'Accessories' },
    { id: 'c6', name: 'Belt', price: 250, unit: 'piece', category: 'Accessories' },
  ],
  general: [
    { id: 'gen1', name: 'Item 1', price: 100, unit: 'piece', category: 'General' },
    { id: 'gen2', name: 'Item 2', price: 200, unit: 'kg', category: 'General' },
  ],
};

export const getDefaultProducts = (shopType) => {
  return DEFAULT_PRODUCTS[shopType] || DEFAULT_PRODUCTS.general;
};

export const UNIT_OPTIONS = ['piece', 'kg', 'gram', 'litre', 'ml', 'packet', 'strip', 'bottle', 'box', 'pair', 'dozen', 'glass'];

export const SHOP_TYPES = [
  { value: 'grocery', label: 'Grocery / Kirana', emoji: '🛒' },
  { value: 'medical', label: 'Medical / Pharmacy', emoji: '💊' },
  { value: 'restaurant', label: 'Restaurant / Dhaba', emoji: '🍛' },
  { value: 'electronics', label: 'Electronics', emoji: '📱' },
  { value: 'clothing', label: 'Clothing / Fashion', emoji: '👗' },
  { value: 'general', label: 'General Store', emoji: '🏪' },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [khata, setKhata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Generic local storage helpers
  const loadLocalData = useCallback((key, defaultValue = []) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch { /* empty */ }
    return defaultValue;
  }, []);

  const saveLocalData = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* empty */ }
  }, []);

  const loadLocalProducts = useCallback((shopId) => loadLocalData(`invoeazy_products_${shopId}`, null), [loadLocalData]);
  const saveLocalProducts = useCallback((shopId, prods) => saveLocalData(`invoeazy_products_${shopId}`, prods), [saveLocalData]);
  
  const loadLocalBills = useCallback((shopId) => loadLocalData(`invoeazy_bills_${shopId}`), [loadLocalData]);
  const saveLocalBills = useCallback((shopId, data) => saveLocalData(`invoeazy_bills_${shopId}`, data), [saveLocalData]);

  const loadLocalKhata = useCallback((shopId) => loadLocalData(`invoeazy_khata_${shopId}`), [loadLocalData]);
  const saveLocalKhata = useCallback((shopId, data) => saveLocalData(`invoeazy_khata_${shopId}`, data), [saveLocalData]);

  // Initialize: restore demo session OR listen to Supabase auth
  useEffect(() => {
    // 1. Check for saved demo session first
    const savedDemoUser = localStorage.getItem('invoeazy_demo_user');
    const savedDemoShop = localStorage.getItem('invoeazy_demo_shop');

    if (savedDemoUser) {
      try {
        const demoUser = JSON.parse(savedDemoUser);
        setUser(demoUser);
        if (savedDemoShop) {
          const demoShop = JSON.parse(savedDemoShop);
          setShop(demoShop);
          const prods = loadLocalProducts(demoShop.id) || getDefaultProducts(demoShop.type);
          setProducts(prods);
          setBills(loadLocalBills(demoShop.id));
          setKhata(loadLocalKhata(demoShop.id));
        }
        // else: user exists but no shop → will show setup wizard
      } catch { /* corrupt data, ignore */ }
      setLoading(false);
      setAuthReady(true);
      return; // skip Supabase auth listener for demo users
    }

    // 2. Supabase auth listener for real users
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          // 1. Check if user is an owner
          const { data: shopData } = await getShopByOwner(currentUser.id);
          
          if (shopData) {
            setShop(shopData);
            const local = loadLocalProducts(shopData.id);
            if (local) {
              setProducts(local);
            } else {
              const defaults = getDefaultProducts(shopData.type);
              setProducts(defaults);
              saveLocalProducts(shopData.id, defaults);
            }
            setBills(loadLocalBills(shopData.id));
            setKhata(loadLocalKhata(shopData.id));
          } else {
            // 2. Not an owner, check if user is an employee
            const { getShopForEmployee } = await import('../lib/supabase.js');
            const { data: empData } = await getShopForEmployee(currentUser.email);
            
            if (empData && empData.shops) {
              const employeeShop = empData.shops;
              setShop(employeeShop);
              
              // Save permissions in local storage so the UI can adapt
              localStorage.setItem('invoeazy_emp_permissions', JSON.stringify(empData.permissions));
              
              const local = loadLocalProducts(employeeShop.id);
              if (local) {
                setProducts(local);
              } else {
                const defaults = getDefaultProducts(employeeShop.type);
                setProducts(defaults);
                saveLocalProducts(employeeShop.id, defaults);
              }
              setBills(loadLocalBills(employeeShop.id));
              setKhata(loadLocalKhata(employeeShop.id));
            } else {
              // User is neither owner nor employee -> needs to setup shop
              setShop(null);
            }
          }
        } catch (e) {
          console.warn('Supabase error fetching shop/employee:', e.message);
        }
      } else {
        setShop(null);
        setProducts([]);
        setBills([]);
        setKhata([]);
      }

      setLoading(false);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, [loadLocalProducts, saveLocalProducts]);

  const updateShopState = (shopData) => {
    setShop(shopData);
    const prods = loadLocalProducts(shopData.id) || getDefaultProducts(shopData.type);
    setProducts(prods);
    saveLocalProducts(shopData.id, prods);
    setBills(loadLocalBills(shopData.id));
    setKhata(loadLocalKhata(shopData.id));
  };

  const updateProducts = (newProducts) => {
    setProducts(newProducts);
    if (shop) saveLocalProducts(shop.id, newProducts);
  };

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: `custom_${Date.now()}`,
    };
    const updated = [...products, newProduct];
    updateProducts(updated);
    return newProduct;
  };

  const editProduct = (id, updates) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    updateProducts(updated);
  };

  const deleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    updateProducts(updated);
  };

  // Demo login — only sets user, NOT shop → triggers setup wizard
  const demoLogin = (role = 'owner') => {
    const demoUser = { id: 'demo_user', email: 'demo@invoeazy.com', role };
    setUser(demoUser);
    setShop(null);   // force setup wizard
    setProducts([]);
    setBills([]);
    setKhata([]);
    setAuthReady(true);
    setLoading(false);
    // Save user only — shop will be saved after setup wizard completes
    localStorage.setItem('invoeazy_demo_user', JSON.stringify(demoUser));
    localStorage.removeItem('invoeazy_demo_shop'); // clear any old shop
  };

  // Full logout — clears everything
  const logout = () => {
    localStorage.removeItem('invoeazy_demo_user');
    localStorage.removeItem('invoeazy_demo_shop');
    setUser(null);
    setShop(null);
    setProducts([]);
    setBills([]);
    setKhata([]);
    // Also sign out from Supabase (no-op if not signed in)
    supabase.auth.signOut().catch(() => {});
  };

  // Bill management
  const addBill = (bill) => {
    const updated = [bill, ...bills];
    setBills(updated);
    if (shop) saveLocalBills(shop.id, updated);
  };

  // Khata management
  const addKhataCustomer = (customer) => {
    const updated = [customer, ...khata];
    setKhata(updated);
    if (shop) saveLocalKhata(shop.id, updated);
  };

  const updateKhataCustomer = (id, updates) => {
    const updated = khata.map(c => c.id === id ? { ...c, ...updates } : c);
    setKhata(updated);
    if (shop) saveLocalKhata(shop.id, updated);
  };

  const value = {
    user, setUser,
    shop, setShop,
    products, bills, khata,
    loading, authReady,
    updateShopState,
    updateProducts,
    addProduct,
    editProduct,
    deleteProduct,
    addBill,
    addKhataCustomer,
    updateKhataCustomer,
    demoLogin,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
