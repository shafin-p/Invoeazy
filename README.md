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

## 📱 Building the Android APK

This project uses **Capacitor** to wrap the web app into a native Android APK.

### Prerequisites for APK Generation
You must have **Android Studio** installed on your Windows machine to compile the APK. 
Download it from: [developer.android.com/studio](https://developer.android.com/studio)

### Steps to create the APK:

1. **Build the Production Web App:**
   First, build the optimized React files into the `dist/` folder:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor Android Project:**
   This copies your `dist/` folder into the Android Studio project:
   ```bash
   npx cap sync android
   ```

3. **Open Android Studio to Build the APK:**
   This command opens the Capacitor Android project inside Android Studio:
   ```bash
   npx cap open android
   ```

4. **Inside Android Studio:**
   - Wait for Gradle to finish syncing (watch the progress bar at the bottom).
   - Go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Once finished, a popup will appear in the bottom right corner saying "Build APK(s) successfully".
   - Click the **"locate"** link in that popup to open the folder containing your brand new `app-debug.apk` file!
   - You can transfer this `.apk` file to your Android phone and install it.

*Note: You can also connect your Android phone via USB, enable USB Debugging, and press the green "Play" button in Android Studio to install it directly to your device.*
