# ShopLite Frontend Client Documentation

This is the client-side single page application (SPA) for the ShopLite e-commerce platform. It is built using **Vue 3**, **Vite**, **TypeScript**, and styled with **TailwindCSS**.

---

## 🛠️ Technology Stack

* **Build Tooling**: Vite
* **Language**: TypeScript
* **State Management**: Reactive Composables (isolated global state refs)
* **Routing**: Vue Router
* **Styling**: TailwindCSS & PostCSS
* **Icons**: Lucide Icons (lucide-vue-next)
* **Payments Integration**: Stripe JS SDK (`@stripe/stripe-js`)

---

## 📂 Source Code Layout (`/src`)

* **[components/](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/components/)**: Reusable UI blocks:
  * `AppHeader.vue`: Navbar with active user status, profile/admin controls, search bar, and dynamic cart item bubble count.
  * `AppFooter.vue`: Footer sections with links.
  * `ProductCard.vue`: Grid card representing a single product (displays price, discount percentage, ratings, add to cart actions).
  * `StripePayment.vue`: Stripe Elements card mounting component for processing payments.
  * `CheckoutBillingForm.vue`, `CheckoutOrderSummary.vue`: Structured forms used during order placement.
* **[composables/](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/composables/)**: Shared reactive state objects.
* **[router/](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/router/)**: URL configuration and route guard definitions.
* **[views/](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/views/)**: Main views rendered by the router:
  * `HomeView.vue`: Layout showcasing carousel categories, featured products, best-selling items, and current promotions.
  * `ShopView.vue`: Interactive catalog displaying filtered results, sorting drop-downs, and sidebar search queries.
  * `ProductDetailView.vue`: Detailed view showing high-res product photos, inventory stock levels, full descriptions, and review boards.
  * `CartView.vue`: Shopping list interface to review items, edit quantities, apply discounts, and redirect to checkout.
  * `CheckoutView.vue`: Interface hosting billing details, guest checkouts, and payment form triggers.
  * `AdminDashboardView.vue`: Powerful console for managing orders, categories, promotions, and users.
  * `ProfileView.vue` / `LoginView.vue` / `RegisterView.vue`: Profile settings and session entry screens.

---

## 🧠 State Management (Composables)

Instead of a heavy external store library (like Pinia), ShopLite uses custom, lightweight TypeScript composables with shared global variables defined outside the main export function.

### 1. Authentication: `useAuth` ([useAuth.ts](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/composables/useAuth.ts))
Exposes reactive references to coordinate user profiles and JWT session handling:
* **State**:
  * `user`: Profile document of the logged-in user.
  * `token`: The active JWT cryptographic string.
  * `isRestoring`: Boolean flag showing if a cached session validation is running.
  * `isAuthenticated` / `isAdmin` / `isSeller`: Computed flags derived from the active user object.
* **Actions**:
  * `login(email, password)`: Authenticates credentials, caches session variables locally, and sets states.
  * `register(payload)`: Saves new user details and initiates registration login.
  * `logout()`: Clears credentials and active stores, removing tokens from cache.
  * `restoreSession()`: Initiates on bootstrap. Checks `localStorage` cached values, sets them temporarily, and performs a background verification call to the `/api/auth/me` endpoint to confirm token validity.
  * `updateProfile(data)`: Submits new settings (e.g. address, phone) to the backend.

### 2. Shopping Cart & Checkout: `useCart` ([useCart.ts](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/composables/useCart.ts))
Handles customer product selection and ordering logic:
* **State**:
  * `cartItems`: Array of cart selections containing references to products and quantities.
  * `activeCoupon`: Object containing current applied promotional details.
  * `checkoutError`: Validation message store.
  * `checkoutSuccess`: Boolean signifying successful payment processing.
* **Key Features**:
  * **Isolated Carts**: Cart caches are saved in `localStorage` dynamically under keys named `cart_{email}` (or `cart_guest`). This prevents different logged-in users sharing the same computer from seeing each other's carts.
  * `addToCart(product, quantity)`: Appends an item to the shopping array, checking that addition doesn't exceed database `stock` limits.
  * `applyCoupon(code)`: Validates code strings via the backend API.
  * `submitCheckout(shippingAddress, paymentMethod, guestCustomer?)`: Submits order items and payment method details. Returns a Stripe `clientSecret` payload if Card payment is selected.
  * `confirmStripeSuccess(order)`: Invoked by StripeElements callbacks on successful transaction, clearing cart caches.

---

## 🚦 Routing & Guards

The Vue Router configuration resides in [router/index.ts](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/router/index.ts).

### Navigation Guards (`beforeEach`)
Protects path routes based on user role authorization states defined in route metadata:
* **`requiresAuth`**: Requires `isAuthenticated` to be `true`. If unauthenticated, the user is redirected to `/login`, storing the original query destination in redirect parameters.
* **`requiresAdmin`**: Requires `isAdmin` to be `true`. Unauthorized users are redirected to the `/forbidden` view.
* **`guestOnly`**: Restricts access to visitors. If an authenticated user attempts to access `/login` or `/register`, they are redirected back to `/`.

---

## 💳 Stripe Checkout Integration

Stripe card payments follow a dual client-server security lifecycle:

1. **Order Initiation**:
   * The client calls `submitCheckout` with `paymentMethod: 'card'`.
   * The backend registers a pending order, deducts stock, creates a Stripe PaymentIntent, and returns a `clientSecret`.
2. **Mounting UI**:
   * The client redirects to a secure payment module containing the [StripePayment.vue](file:///c:/Users/Ahmed%20Maher/Downloads/VueJs-ECommerce/frontend/vite-project/src/components/StripePayment.vue) component.
   * The component loads the Stripe Elements form using the `clientSecret`.
3. **Card Processing**:
   * The customer submits card information directly to Stripe's secure servers.
   * If successful, the client triggers `confirmStripeSuccess` to clear the cart and render a confirmation screen.
   * Stripe asynchronously transmits a webhook trigger (`payment_intent.succeeded`) to the backend `/api/orders/webhook` endpoint to officially set the order state to `paid`.

---

## 💻 Commands Reference

Ensure you are inside the `frontend/vite-project` directory before running these commands:

* **Install dependencies**:
  ```bash
  npm install
  ```
* **Start Vite dev server**:
  ```bash
  npm run dev
  ```
* **Verify Typescript & Build for production bundle**:
  ```bash
  npm run build
  ```
* **Locally review the production build (Preview)**:
  ```bash
  npm run preview
  ```
