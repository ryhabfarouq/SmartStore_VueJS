# 🛒 Smart Store — Full Stack E-Commerce Platform

A modern, scalable, and responsive **Full Stack E-Commerce Web Application** built with **Vue.js**, **TypeScript**, **Node.js**, and **Express.js**.

Smart Store provides a complete shopping experience for customers, sellers, and administrators with secure authentication, role-based authorization, product management, order processing, and payment integration.

---

## 🚀 Technologies Used

### 🎨 Frontend

* Vue.js
* Vite
* TypeScript
* Tailwind CSS
* Vue Router
* Composition API
* Fetch API / Axios
* Local Storage

### ⚙️ Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Password Encryption & Hashing
* Middleware
* Role-Based Authorization
* Environment Variables

---

## ✨ Features

### 👤 User Management

* User registration and login
* Secure password encryption and hashing
* JWT-based authentication
* Login using:

  * Email
  * Phone number
  * Google authentication *(Bonus)*
* Email confirmation
* Secure protected routes
* User profile management:

  * Name
  * Address
  * Payment details
  * Personal information
* Multi-user role system:

  * Customer
  * Seller
  * Admin
* Wishlist and favorites
* Order history
* Product reviews and ratings

---

## 🔐 Authentication & Authorization

The application uses **JSON Web Tokens (JWT)** for secure authentication.

After successful login, the server generates a JWT token that is used to authenticate protected API requests.

### Authentication Flow

```text
User Login
    ↓
Validate Credentials
    ↓
Verify Encrypted Password
    ↓
Generate JWT Token
    ↓
Return Authentication Token
    ↓
Access Protected APIs
```

The backend uses authentication and authorization middleware to protect application resources.

### Role-Based Authorization

```text
Customer → Customer Features
Seller   → Seller Dashboard & Products
Admin    → Full System Management
```

---

## 📦 Product Management

* Product categories
* Product listings
* Multiple product images
* Detailed product descriptions
* Product pricing
* Stock availability
* Inventory management
* Search products by name
* Advanced product filtering:

  * Price
  * Category
  * Availability
* Responsive product catalog

---

## 🛒 Shopping Cart & Checkout

* Add products to cart
* Remove products from cart
* Adjust product quantities
* Dynamic cart updates
* Order summary
* Detailed price breakdown
* Guest checkout
* Multiple payment methods:

  * Credit Card
  * PayPal
  * Cash on Delivery
  * Wallet
* Promo codes and discounts *(Bonus)*

---

## 📋 Order Management

* Order placement
* Order confirmation
* Order history
* Order tracking
* Dynamic order status updates
* Email order notifications

### Order Status

```text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

Orders can also be marked as:

```text
Cancelled
```

---

## 💳 Payment Integration

Secure payment gateway integration with services such as:

* Stripe
* PayPal
* Razorpay

Additional payment features:

* Secure checkout process
* Saved payment cards *(Bonus)*
* Payment auto-fill for faster checkout *(Bonus)*

---

## 🛡️ Admin Panel

The Admin Dashboard provides complete system management functionality.

### User Management

* View users
* Approve users
* Restrict users
* Soft delete users
* Manage user roles

### Product Management

* Add products
* Update products
* Delete products
* Manage product stock
* Manage categories

### Order & Shipping Management

* View all orders
* Manage orders
* Update order status
* Shipping management

### Marketing Management

* Manage discounts
* Manage promo codes *(Bonus)*
* Manage homepage banners
* Homepage content management

---

## 🏪 Seller / Vendor Management

* Seller registration
* Seller profile setup
* Seller dashboard
* Product listing management
* Add new products
* Update products
* Delete products
* Inventory management
* Stock management
* Order processing
* Order status updates
* Earnings management
* Seller payout management

---

## 👥 User Roles

| Role        | Permissions                                                           |
| ----------- | --------------------------------------------------------------------- |
| 👤 Customer | Browse products, manage cart, checkout, wishlist, orders, and reviews |
| 🏪 Seller   | Manage products, inventory, and seller orders                         |
| 🛡️ Admin   | Full system management including users, products, orders, and content |

---

## 📁 Project Structure

```text
smart-store/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── services/
│   │   ├── composables/
│   │   ├── types/
│   │   ├── layouts/
│   │   ├── App.vue
│   │   └── main.ts
│   │
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Navigate to the Project

```bash
cd smart-store
```

---

## 🎨 Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the Vite development server:

```bash
npm run dev
```

The frontend application will be available at:

```text
http://localhost:5173
```

---

## ⚙️ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_connection_string
```

Run the backend development server:

```bash
npm run dev
```

The backend API will be available at:

```text
http://localhost:5000
```

---

## 🌐 REST API

The backend provides RESTful API endpoints for application resources.

### Authentication API

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

### Products API

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
```

### Orders API

```text
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PATCH  /api/orders/:id/status
```

### Users API

```text
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

---

## 🔒 Security

The backend implements multiple security practices:

* JWT authentication
* Password encryption and hashing
* Protected API routes
* Authentication middleware
* Role-based authorization
* Environment variables
* Secure password validation
* API error handling
* Sensitive data protection

Passwords are never stored as plain text.

---

## 🎨 UI & Styling

The frontend is built using:

* Vue.js
* Tailwind CSS
* Responsive layouts
* Reusable Vue components
* Vue Composition API
* Mobile-first design

The application is fully responsive and optimized for:

* 📱 Mobile devices
* 📟 Tablets
* 💻 Laptops
* 🖥️ Desktop screens

---

## 🧭 Vue Router

Vue Router is used for client-side navigation and route protection.

### Public Routes

```text
/
/products
/products/:id
/login
/register
```

### Protected Routes

```text
/profile
/cart
/checkout
/orders
/wishlist
```

### Role-Based Routes

```text
/admin/*   → Admin Only
/seller/*  → Seller Only
```

Navigation guards prevent unauthorized users from accessing protected pages.

---

## 🌟 Future Improvements

* Pinia state management
* Server-Side Rendering with Nuxt
* Real-time order tracking
* WebSocket integration
* Push notifications
* AI-powered product recommendations
* Advanced analytics dashboard

---

## 👩‍💻 Author

**Ryhab Farouq**

Frontend Developer & Web Development Instructor

---

## 📄 License

This project is developed for educational and training purposes.

---

⭐ If you like this project, consider giving the repository a star!
