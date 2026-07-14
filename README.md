# ShopLite E-Commerce Platform

ShopLite is a modern, responsive, full-stack e-commerce application. It features a frontend built with **Vue 3 (Composition API)**, **TypeScript**, **Vite**, and **TailwindCSS**, paired with a robust and modular backend powered by **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **Stripe** for payment processing.

---

🌐**Demo (Live Preview):** <a href="https://vue-js-e-commerce-iti.vercel.app/" target="_blank">https://vue-js-e-commerce-iti.vercel.app</a> 

---

## 👀 Website Preview:
<a href="https://vue-js-e-commerce-iti.vercel.app/" title="demo">
  <img src="https://github.com/user-attachments/assets/8d581b07-672c-439c-b1c4-74be52a38754" alt="website preview - Demo - UI Mockup" width="400">
</a>

---

## 🚀 Key Features

* **Role-Based Authentication & Profiles**: Secure registration and login using JSON Web Tokens (JWT) with distinct roles: `Customer`, `Seller`, and `Admin`.
* **Advanced Product Catalog**: Multi-criteria filtering (by category, brand, price range, stock levels, and rating), full-text search, sorting (by price, rating, and date), and paginated listings.
* **Interactive Reviews**: Authenticated customers can submit ratings and text reviews for products, dynamically updating average ratings.
* **Smart Shopping Cart**: Persistent, user-isolated carts (stored in `localStorage` keyed to user email, or managed in guest mode).
* **Checkout & Stripe Payment**: Seamless billing information collection, support for Cash on Delivery (COD) and Card payments, direct integration with the Stripe Elements SDK, and server-side Stripe signature verification via webhooks.
* **Coupon & Discount Engine**: Dynamic promotional code validation supporting fixed-amount and percentage discounts, active state toggles, and expiration dates.
* **Comprehensive Admin Portal**:
  * Visual statistics (total revenue, active users, pending orders, total products).
  * Full User management (approving, restricting, promoting roles, soft-deletes).
  * Category management (creating, editing, and deleting categories with custom promo images).
  * Coupon management (generating and deleting codes).
  * Order fulfillment (updating status: Pending, Dispatched, Delivered, Cancelled).
* **Automated Seeders**: CLI scripts to initialize the database with high-quality mock products, categories, reviews, and pre-configured test users.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: Vue 3 (Composition API, `<script setup>`), TypeScript, Vite
* **Routing**: Vue Router
* **Styling**: TailwindCSS, PostCSS, Autoprefixer
* **Icons**: Lucide Icons (`@lucide/vue`, `lucide-vue-next`)
* **Payments**: Stripe JS (`@stripe/stripe-js`)

### Backend
* **Core**: Node.js, Express.js
* **Database**: MongoDB & Mongoose ODM
* **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for password hashing
* **Payments**: Stripe Node SDK
* **Utilities**: `pdfkit` (for PDF invoice generation), `cors`, `dotenv`
* **Development**: Nodemon

---

## 📂 Project Structure

```text
VueJs-ECommerce/
├── backend/                  # Node.js/Express Server
│   ├── src/
│   │   ├── config/           # Database connections and settings
│   │   ├── controllers/      # Route request handler classes
│   │   ├── models/           # Mongoose schemas (User, Product, etc.)
│   │   ├── middleware/       # JWT authentication and authorization checks
│   │   ├── routes/           # REST API Route declarations
│   │   ├── seeders/          # Database mock data initialization scripts
│   │   └── services/         # Core business logic layer
│   ├── server.js             # Main server entry point
│   └── API.md                # Dedicated API reference guide
│
├── frontend/
│   └── vite-project/         # Vue 3 Frontend Client
│       ├── src/
│       │   ├── components/   # Reusable UI elements (Header, Cart, Forms)
│       │   ├── composables/  # Reactive state functions (useAuth, useCart)
│       │   ├── router/       # Vue router configurations and guards
│       │   ├── views/        # Page views (Home, Shop, Admin, Cart)
│       │   ├── App.vue       # Main root component
│       │   └── main.ts       # Frontend application bootsrapper
│       └── README.md         # Dedicated frontend developer guide
│
└── README.md                 # Project root workspace manual (this file)
```

---

## ⚙️ Setup & Local Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (local database running on port `27017` or a MongoDB Atlas connection string)
* [Stripe Account](https://stripe.com/) (to obtain test publishable, secret, and webhook signing keys)

---

### Step 1: Set Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the `backend/` folder (use the template below or read the [.env documentation](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/API.md#environment-variables)):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shoplite
   JWT_SECRET=your_jwt_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Seed the database with sample categories, products, and users:
   ```bash
   npm run db:seed
   ```
   * *Alternative seeders:*
     * `npm run db:seed-all` (Seeds full dataset)
     * `npm run db:seed-users` (Seeds base users only)
     * `npm run db:seed-products` (Seeds categories and products only)
     * `npm run db:seed-test-users` (Seeds dedicated login test cases)

5. Run the backend development server:
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:5000`.

---

### Step 2: Set Up the Frontend

1. Navigate to the frontend client directory:
   ```bash
   cd ../frontend/vite-project
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   Open the browser and head to the local address outputted by Vite (typically `http://localhost:5173`).

---

## 📖 Sub-Documentation Guides

For deeper details on specific parts of the project, refer to these guides:
* 📡 **[Backend API & Schema Documentation](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/backend/API.md)**: Details on all REST endpoints, body payloads, responses, authorization rules, Mongoose Schemas, and the Stripe webhook system.
* 🖥️ **[Frontend Architecture Documentation](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/README.md)**: Details on the Vue 3 structure, client routing guards, state composables (`useAuth` and `useCart`), and layout components.
