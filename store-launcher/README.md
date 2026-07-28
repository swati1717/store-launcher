# HotWax Store Launcher

HotWax Store Launcher is a powerful internal tool built with **Vue 3, Ionic, and Vite**. It is designed to rapidly bootstrap brand-new Shopify stores by automatically injecting complete HotWax Commerce configuration and bulk datasets.

Instead of spending hours manually configuring a new Shopify store for client demonstrations or development, this app uses Shopify's **GraphQL Admin API** and **Staged Uploads API** to configure settings and upload thousands of products, locations, and inventory counts in a matter of seconds.

## ✨ Features

- **Instant Store Configuration**: Automatically configures critical Shopify settings (Timezone, Currency, Order Formats, Customer Account settings, and Tax behaviors) with a single click.
- **Bulk Locations Setup**: Upload your own JSON array of locations or use the built-in HotWax defaults to instantly populate the store's fulfillment network.
- **Staged Uploads Product Pipeline**: Bypasses traditional REST and GraphQL rate limits by streaming massive `ProductSetInput` JSONL payloads directly to Google Cloud, triggering Shopify's asynchronous bulk processing engine.
- **Dynamic Inventory Allocation**: Automatically fetches active locations and dynamically generates bulk inventory mappings via the declarative `productSet` mutation to assign massive stock levels instantly.
- **Real-Time Polling UI**: Clean, glassmorphism UI that polls Shopify's bulk operation webhook endpoints to give real-time feedback on upload phases.

---

## 🛠️ Prerequisites

Before you begin, ensure you have met the following requirements:
* **Node.js**: `v18.0.0` or newer.
* **npm**: `v9.0.0` or newer.

---

## 🚀 Installation & Setup

1. **Navigate to the project directory** (if you aren't already there):
   ```bash
   cd store-launcher
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The app will automatically open in your default browser at `http://localhost:5173`.*

---

## 🔑 Shopify Store Connection

To use the Store Launcher, you must connect it to a Shopify store via a Custom App Access Token.

### 1. Create a Custom App in Shopify
1. Go to your Shopify Admin Panel.
2. Navigate to **Settings** > **Apps and sales channels** > **Develop apps**.
3. Click **Create an app** (e.g., name it "HotWax Launcher").

### 2. Configure API Scopes
Click **Configure Admin API scopes** and grant **Read and Write** access for the following areas:
- `Products`
- `Inventory`
- `Locations`
- `Store content`
- `Orders` (Optional, for future roadmap)

### 3. Install the App
1. Click **Install app** in the top right corner.
2. Reveal and copy the **Admin API access token** (it starts with `shpat_...`).

### 4. Connect in the UI
1. Open the HotWax Store Launcher (`http://localhost:5173`).
2. Enter your store's `.myshopify.com` URL.
3. Paste the `shpat_...` access token.
4. Click **Connect Store** to access the dashboard!

---

## 📂 Project Structure

- `src/views/` - Contains the main Ionic page components (`Dashboard`, `ProductsSetup`, `InventorySetup`, etc.).
- `src/services/ShopifyService.ts` - The core engine handling all GraphQL interactions, Staged Upload orchestration, and polling logic.
- `src/store/auth.ts` - Pinia state management handling the encrypted storage of the Shopify access token.
- `public/templates/` - Contains the default `.jsonl` and `.json` datasets for HotWax products, inventory, and locations.

---

## 💡 Tech Stack

- **Vue 3** (Composition API & `<script setup>`)
- **Ionic Framework** (Mobile-first UI components)
- **Vite** (Next-generation frontend tooling)
- **Pinia** (State management)
- **Shopify GraphQL Admin API** (Data manipulation)
