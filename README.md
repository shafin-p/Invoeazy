<div align="center">

# 🧾 Invoeazy
### Smart Billing Platform for Modern Shops

[![Build APK](https://github.com/shafin-p/Invoeazy/actions/workflows/build-apk.yml/badge.svg)](https://github.com/shafin-p/Invoeazy/actions/workflows/build-apk.yml)
![Version](https://img.shields.io/badge/version-1.0.0-7C3AED)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**A mobile-first, offline-capable billing app for small shop owners — generate QR bills, manage inventory, and track customer credit (Khata) in seconds.**

[📱 Download APK](#-download-android-apk) · [🚀 Features](#-features) · [🛠 Tech Stack](#-tech-stack) · [⚙️ Setup](#️-local-development-setup)

---

</div>

## 📸 Screenshots

> _Install the APK on your Android device to experience the full app._

---

## 🚀 Features

### 🏪 Phase 1 — Shop Setup & Inventory
- Beautiful registration flow with shop type selection (Kirana, Medical, Restaurant, etc.)
- Pre-loaded product catalog based on your shop type
- Full **Product Manager** — add, edit, delete inventory with units, prices, and categories

### 🧾 Phase 2 — Smart Billing & QR Invoices
- Add items to cart with smart **quantity controls** (supports kg/gram, litre/ml, strip/piece, dozen)
- **Auto price calculation** — enter qty in any unit, price is calculated at base unit rate
- **Quick Add** — if a product isn't in your inventory, add it on-the-fly while billing
- Generate a professional **digital bill** with a unique **QR Code**
- Customers scan the QR to **view and save their digital receipt** on any device
- All bills stored permanently on the device

### 📖 Phase 3 — Khata (Credit Book)
- Mark any bill as **Khata** (credit purchase)
- Automatically adds the bill to the customer's running balance
- View total balance owed per customer

### 📊 Phase 4 — Revenue Dashboard (Home Screen)
- Real-time stats: **Today's Bills**, **Today's Revenue**, **Monthly Revenue**
- Live shop status display with greeting and shop type badge

### 🎨 Phase 5 — Bill Designer
- Customize your bill's **accent color**, **typography**, and **layout theme** (Modern / Classic Thermal)
- Upload your **shop logo** to print on every receipt

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Vanilla CSS (Mobile-first, CSS Variables, `clamp()`) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Auth & DB** | Supabase (Email/Password Auth + PostgreSQL) |
| **Offline Storage** | `localStorage` for bills, products, and Khata |
| **Mobile App** | Capacitor 8 (Android APK wrapper) |
| **CI/CD** | GitHub Actions (Auto APK build on every push) |
| **Bill Sharing** | Base64 URL encoding — no server needed for QR bills |

---

## 📱 Download Android APK

The APK is automatically built in the cloud every time code is pushed. **No Android Studio required.**

1. Go to the **[Actions tab](https://github.com/shafin-p/Invoeazy/actions)** of this repository
2. Click the latest green ✅ build named **"Build Android APK"**
3. Scroll down to the **"Artifacts"** section
4. Click **`Invoeazy-App-APK`** to download the `.zip`
5. Extract it → transfer the `.apk` to your Android phone → tap to install

> **Note:** On your phone, go to Settings → Security → Allow installation from unknown sources before installing.

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 20+
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shafin-p/Invoeazy.git
cd Invoeazy

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Open .env and add your Supabase credentials

# 4. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser. Switch to **mobile device emulation** in DevTools for the best experience.

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

> ⚠️ **NEVER commit your `.env` file.** It is listed in `.gitignore` to keep your credentials safe.

---

## 🔒 Security

This application follows these security practices:

| Practice | Status |
|---|---|
| API keys loaded from `.env` environment variables | ✅ |
| `.env` file in `.gitignore` — never pushed to GitHub | ✅ |
| Only the **anon key** (public, safe) is used in the frontend | ✅ |
| No `service_role` key in client-side code | ✅ |
| Supabase **Row Level Security (RLS)** should be enabled on all tables | ⚠️ Configure in Supabase Dashboard |
| Bill data in QR codes is Base64-encoded (not encrypted) — contains no passwords | ✅ |

### Recommended Supabase RLS Policies
In your Supabase dashboard, enable RLS on all tables and add policies so users can only see their own data:
```sql
-- Example: shops table
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own shop"
  ON shops FOR ALL USING (auth.uid() = owner_id);
```

---

## ☁️ QR Code Hosting

For QR codes to work when scanned by customers, the web app must be publicly accessible. Host it free on:

- **GitHub Pages** — push to `gh-pages` branch or use Actions
- **Netlify** — drag and drop your `dist/` folder
- **Vercel** — connect your GitHub repo

After deploying, the QR bill URL is already configured to point to:
```
https://shafin-p.github.io/invoeazy/?data=<encoded-bill>
```

---

## 📁 Project Structure

```
invoeazy/
├── .github/workflows/      # GitHub Actions CI/CD
│   └── build-apk.yml       # Auto APK builder
├── android/                # Capacitor Android project
├── assets/                 # Source icon & splash (1024×1024 PNG)
├── public/                 # Static assets & PWA manifest
├── src/
│   ├── components/         # Reusable UI (BottomNav)
│   ├── context/            # AppContext (global state)
│   ├── lib/                # Supabase client
│   ├── screens/            # All app screens
│   │   ├── AuthScreen.jsx
│   │   ├── BillingScreen.jsx
│   │   ├── BillViewerScreen.jsx
│   │   ├── BillDesignerScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── KhataScreen.jsx
│   │   ├── ProductManagerScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   └── ShopSetupScreen.jsx
│   ├── App.jsx             # Root router & shell
│   ├── index.css           # Global design system
│   └── main.jsx
├── capacitor.config.json   # Capacitor config
├── package.json
└── vite.config.js
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

<div align="center">
Made with ❤️ for small shop owners everywhere
</div>
