# Invoeazy — Smart Billing App

Invoeazy is a mobile-first web app built for small shop owners (Kirana, Medical, Restaurants, etc.) to manage their inventory, generate QR bills, and track customer credit (Khata).

## 🚀 Features

- **Phase 1: Shop Setup & Inventory**
  - Registration & Demo Mode.
  - Shop setup wizard with pre-loaded products based on shop type.
  - Product Manager to add, edit, and delete inventory items.

- **Phase 2: Billing & QR Invoices**
  - Add items to cart with quantity controls.
  - Generate a digital bill with a unique QR code.
  - Customers can scan the QR code to view and save the bill.

- **Phase 3: Khata (Credit) Book**
  - Add customers and track their balances.
  - Add credit and payment transactions.
  - Live balance calculation (who owes who).

## 🛠 Tech Stack

- **Frontend:** React + Vite (Mobile-first, CSS variables).
- **Backend/Auth:** Supabase (for persistent user accounts).
- **Local Storage:** Used extensively for offline-first capabilities (Demo Mode).
- **Mobile Wrapper:** Capacitor for Android APK generation.

---

## 💻 Running the App Locally

To run the web version locally in your browser:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser. (Switch to mobile view/inspector for the best experience).

---

## 📱 Download & Install Android APK

You don't need Android Studio or a heavy computer to get the `.apk` file. We use **GitHub Actions** to automatically build the app in the cloud!

### How to Download the Latest APK:
1. Go to the **[Actions tab](https://github.com/)** of this GitHub repository. *(Replace URL once uploaded)*
2. Click on the latest green successful build named **"Build Android APK"**.
3. Scroll down to the **"Artifacts"** section.
4. Click on **`Invoeazy-App-APK`** to download the zip file.
5. Extract the `.zip` to get your `.apk` file.
6. Transfer it to your Android phone, click it, and install!

---

## ☁️ Hosting for QR Bills

To ensure the QR codes scanned by customers work perfectly:
1. Host this code for free on **GitHub Pages**, **Vercel**, or **Netlify**.
2. Once you have your public URL (e.g. `https://your-name.github.io/invoeazy/`), open `src/screens/BillingScreen.jsx`.
3. Update the `qrUrl` constant to match your public URL:
   ```javascript
   const qrUrl = `https://your-name.github.io/invoeazy/?data=${encodedData}`;
   ```
4. Push the changes to GitHub. The new APK built will now generate internet-accessible QR codes!
